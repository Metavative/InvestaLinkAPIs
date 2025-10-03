export const paginate = async (query, { page, limit, sort }, model) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    model.find(query).sort(sort).skip(skip).limit(limit),
    model.countDocuments(query),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
};
