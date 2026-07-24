import type { Db } from "mongodb";

module.exports = {
  async up(db: Db): Promise<void> {
    await db
      .collection("activities")
      .updateMany(
        { isIndexable: { $exists: false } },
        { $set: { isIndexable: true } },
      );
  },

  async down(db: Db): Promise<void> {
    await db
      .collection("activities")
      .updateMany({}, { $unset: { isIndexable: "" } });
  },
};
