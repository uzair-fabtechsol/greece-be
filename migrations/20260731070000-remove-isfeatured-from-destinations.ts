import type { Db } from "mongodb";

module.exports = {
  async up(db: Db): Promise<void> {
    await db
      .collection("destinations")
      .updateMany({}, { $unset: { isFeatured: "" } });
  },

  async down(db: Db): Promise<void> {
    await db
      .collection("destinations")
      .updateMany(
        { isFeatured: { $exists: false } },
        { $set: { isFeatured: false } },
      );
  },
};
