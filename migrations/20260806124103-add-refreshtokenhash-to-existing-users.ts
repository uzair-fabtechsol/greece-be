import type { Db } from "mongodb";

module.exports = {
  async up(db: Db): Promise<void> {
    await db
      .collection("users")
      .updateMany(
        { refreshTokenHash: { $exists: false } },
        { $set: { refreshTokenHash: null } },
      );
  },

  async down(db: Db): Promise<void> {
    await db
      .collection("users")
      .updateMany({}, { $unset: { refreshTokenHash: "" } });
  },
};
