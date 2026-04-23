import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  GoogleGenerativeAI,
  type ResponseSchema,
  SchemaType,
} from "@google/generative-ai";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { GrammarCheckResponseDto } from "./dto/grammar-check-response.dto";

const GRAMMAR_CHECK_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    language: { type: SchemaType.STRING },
    correctedText: { type: SchemaType.STRING },
    corrections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: {
            type: SchemaType.STRING,
            format: "enum",
            enum: [
              "grammar",
              "spelling",
              "punctuation",
              "style",
              "word_choice",
            ],
          },
          original: { type: SchemaType.STRING },
          corrected: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING },
          position: {
            type: SchemaType.OBJECT,
            properties: {
              offset: { type: SchemaType.INTEGER },
              length: { type: SchemaType.INTEGER },
            },
            required: ["offset", "length"],
          },
        },
        required: ["type", "original", "corrected", "explanation", "position"],
      },
    },
  },
  required: ["language", "correctedText", "corrections"],
};

const SYSTEM_PROMPT = `You are a grammar checker. Analyze the provided text and identify all grammar, spelling, punctuation, style, and word choice issues.

For each issue:
- Classify the type (grammar, spelling, punctuation, style, word_choice)
- Provide the original incorrect text
- Provide the corrected text
- Write a brief, clear explanation of why it's wrong
- Provide the exact character offset and length of the error in the original text

Auto-detect the language of the input text and return its BCP 47 code (e.g., "en", "en-US", "zh-CN", "vi").
Return correctedText with all corrections applied.
If no issues are found, return an empty corrections array.`;

@Injectable()
export class GrammarService {
  private readonly logger = new Logger(GrammarService.name);

  constructor(private readonly configService: ConfigService) {}

  async check(text: string): Promise<GrammarCheckResponseDto> {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (!apiKey) {
      throw new AppException(ErrorCode.GRAMMAR_API_CONFIG_ERROR);
    }

    const model =
      this.configService.get<string>("GEMINI_MODEL") || "gemini-2.0-flash";

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const generativeModel = genAI.getGenerativeModel(
        {
          model,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: GRAMMAR_CHECK_SCHEMA,
          },
          systemInstruction: SYSTEM_PROMPT,
        },
        { timeout: 60_000 },
      );

      const result = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text }] }],
      });

      const response = result.response;
      const parsed = JSON.parse(response.text());

      return {
        language: parsed.language,
        correctedText: parsed.correctedText,
        totalIssues: parsed.corrections.length,
        corrections: parsed.corrections,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }

      this.logger.error(
        `Gemini API call failed: ${error.message}`,
        error.stack,
      );

      if (error?.status === 429 || error?.message?.includes("429")) {
        throw new AppException(ErrorCode.GRAMMAR_RATE_LIMITED);
      }

      throw new AppException(ErrorCode.GRAMMAR_API_ERROR);
    }
  }
}
