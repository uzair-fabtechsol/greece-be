import type { Db } from "mongodb";

module.exports = {
  async up(db: Db): Promise<void> {
    await db
      .collection("activities")
      .updateMany(
        { isFeatured: { $exists: false } },
        { $set: { isFeatured: false } },
      );
  },

  async down(db: Db): Promise<void> {
    await db
      .collection("activities")
      .updateMany({}, { $unset: { isFeatured: "" } });
  },
};
