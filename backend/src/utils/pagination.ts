import { PaginationOptions } from '../types';

export function parsePagination(
  query: Record<string, unknown>
): PaginationOptions {
  const page = Math.max(
    1,
    parseInt(String(query.page || '1'), 10)
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      parseInt(String(query.limit || '20'), 10)
    )
  );

  return {
    page,
    limit,
  };
}

export function buildPaginationMeta(
  total: number,
  { page, limit }: PaginationOptions
) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}