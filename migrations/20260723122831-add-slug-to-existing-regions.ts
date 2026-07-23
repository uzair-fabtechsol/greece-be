import type { Collection, Db, ObjectId } from "mongodb";

function generateSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(
  collection: Collection,
  name: string,
  excludeId: ObjectId,
): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let suffix = 2;

  while (
    await collection.findOne({ slug, _id: { $ne: excludeId } })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

module.exports = {
  async up(db: Db): Promise<void> {
    const collection = db.collection("regions");

    const regions = await collection
      .find({ $or: [{ slug: { $exists: false } }, { slug: null }] })
      .toArray();

    for (const region of regions) {
      const slug = await generateUniqueSlug(collection, region.name, region._id);
      await collection.updateOne({ _id: region._id }, { $set: { slug } });
    }
  },

  async down(db: Db): Promise<void> {
    await db.collection("regions").updateMany({}, { $unset: { slug: "" } });
  },
};
