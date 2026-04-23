import { ApiProperty } from "@nestjs/swagger";

export class AttachmentResponseDto {
  @ApiProperty({ format: "uuid" }) id: string;
  @ApiProperty() fileUrl: string;
  @ApiProperty() fileName: string;
  @ApiProperty() mimeType: string;
  @ApiProperty({ description: "Bytes" }) fileSize: number;
}
