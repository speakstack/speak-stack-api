import { ApiProperty } from "@nestjs/swagger";

export class CorrectionPositionDto {
  @ApiProperty({ description: "Character offset in original text", example: 0 })
  offset: number;

  @ApiProperty({ description: "Length of the incorrect text", example: 1 })
  length: number;
}

export class CorrectionDto {
  @ApiProperty({
    description: "Type of issue",
    enum: ["grammar", "spelling", "punctuation", "style", "word_choice"],
    example: "grammar",
  })
  type: string;

  @ApiProperty({ description: "Original incorrect text", example: "i" })
  original: string;

  @ApiProperty({ description: "Corrected text", example: "I" })
  corrected: string;

  @ApiProperty({
    description: "Explanation of why it is wrong",
    example: "The pronoun 'I' should always be capitalized.",
  })
  explanation: string;

  @ApiProperty({ description: "Position in the original text" })
  position: CorrectionPositionDto;
}

export class GrammarCheckResponseDto {
  @ApiProperty({ description: "Detected language (BCP 47 code)", example: "en" })
  language: string;

  @ApiProperty({
    description: "Text with all corrections applied",
    example: "I want to learn English grammar.",
  })
  correctedText: string;

  @ApiProperty({ description: "Total number of issues found", example: 4 })
  totalIssues: number;

  @ApiProperty({ description: "List of corrections", type: [CorrectionDto] })
  corrections: CorrectionDto[];
}
