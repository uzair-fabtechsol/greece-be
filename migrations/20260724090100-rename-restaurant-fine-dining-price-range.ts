import type { Db } from "mongodb";

module.exports = {
  async up(db: Db): Promise<void> {
    await db
      .collection("restaurants")
      .updateMany(
        { priceRange: "fine-dining" },
        { $set: { priceRange: "premium" } },
      );
  },

  async down(db: Db): Promise<void> {
    await db
      .collection("restaurants")
      .updateMany(
        { priceRange: "premium" },
        { $set: { priceRange: "fine-dining" } },
      );
  },
};
