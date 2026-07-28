const paginate = (page = 1, limit = 10, total = 0) => {
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  return {
    currentPage,
    totalPages,
    totalItems: total,
    itemsPerPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };
};

module.exports = paginate;