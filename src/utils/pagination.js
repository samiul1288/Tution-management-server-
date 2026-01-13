export const getPagination = (page = 1, limit = 10) => {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const perPage = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (currentPage - 1) * perPage;

  return { skip, perPage, currentPage };
};
