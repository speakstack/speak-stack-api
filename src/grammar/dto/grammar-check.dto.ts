import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength } from "class-validator";

export class GrammarCheckDto {
  @ApiProperty({
    description: "Text to check for grammar issues (max 5000 characters)",
    example: "i want learn english grammer",
  })
  @IsString({ message: "Text must be a string" })
  @Matches(/\S/, { message: "Text must not be empty" })
  @MaxLength(5000, { message: "Text must not exceed 5000 characters" })
  text: string;
}
