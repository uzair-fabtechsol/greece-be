import type { Db } from "mongodb";

module.exports = {
  async up(db: Db): Promise<void> {
    await db
      .collection("destinations")
      .updateMany(
        { tipsAndTricks: { $exists: false } },
        { $set: { tipsAndTricks: [] } },
      );
  },

  async down(db: Db): Promise<void> {
    await db
      .collection("destinations")
      .updateMany({}, { $unset: { tipsAndTricks: "" } });
  },
};
