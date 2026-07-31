import type { Db } from "mongodb";

module.exports = {
  async up(db: Db): Promise<void> {
    const collection = db.collection("restaurants");

    const restaurants = await collection
      .find({ $or: [{ tagLine: { $exists: false } }, { tagLine: null }] })
      .toArray();

    for (const restaurant of restaurants) {
      await collection.updateOne(
        { _id: restaurant._id },
        { $set: { tagLine: restaurant.name } },
      );
    }
  },

  async down(db: Db): Promise<void> {
    await db
      .collection("restaurants")
      .updateMany({}, { $unset: { tagLine: "" } });
  },
};
