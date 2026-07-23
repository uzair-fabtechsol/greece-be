interface SlugSource {
  exists(filter: Record<string, unknown>): Promise<unknown>;
}

// FUNCTION
const generateSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// FUNCTION
const generateUniqueSlug = async (
  model: SlugSource,
  name: string,
  excludeId?: string,
): Promise<string> => {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let suffix = 2;

  while (
    await model.exists(excludeId ? { slug, _id: { $ne: excludeId } } : { slug })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

export { generateSlug, generateUniqueSlug };
