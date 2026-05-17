export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function parsePagination(
  page: number,
  limit: number,
  maxLimit = 100,
): PaginationParams {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  return { page: safePage, limit: safeLimit };
}

export function paginatedMeta(
  total: number,
  { page, limit }: PaginationParams,
): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function skipTake({ page, limit }: PaginationParams) {
  return { skip: (page - 1) * limit, take: limit };
}
