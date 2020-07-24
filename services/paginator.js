const paginator = ({ model, query, page = 1, limit = 25 }) => {
  return model.paginate(query, { page: page, limit: limit })
};

module.exports = paginator