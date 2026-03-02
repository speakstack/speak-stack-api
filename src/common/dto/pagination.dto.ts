import { ApiProperty } from "@nestjs/swagger";

export class PaginationDto {
  @ApiProperty({ description: "Current page number" })
  page: number;

  @ApiProperty({ description: "Items per page" })
  limit: number;

  @ApiProperty({ description: "Total number of items" })
  total: number;

  @ApiProperty({ description: "Total number of pages" })
  totalPages: number;

  @ApiProperty({ description: "Whether there is a next page" })
  hasNextPage: boolean;

  @ApiProperty({ description: "Whether there is a previous page" })
  hasPreviousPage: boolean;
}

export function buildPagination(
  page: number,
  limit: number,
  total: number,
): PaginationDto {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
