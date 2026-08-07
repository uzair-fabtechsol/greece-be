import type { Db } from "mongodb";

module.exports = {
  async up(db: Db): Promise<void> {
    await db
      .collection("trips")
      .updateMany(
        { user: { $exists: true } },
        { $rename: { user: "traveller" } },
      );
  },

  async down(db: Db): Promise<void> {
    await db
      .collection("trips")
      .updateMany(
        { traveller: { $exists: true } },
        { $rename: { traveller: "user" } },
      );
  },
};
