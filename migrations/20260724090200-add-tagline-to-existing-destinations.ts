import type { Db } from "mongodb";

module.exports = {
  async up(db: Db): Promise<void> {
    const collection = db.collection("destinations");

    const destinations = await collection
      .find({ $or: [{ tagLine: { $exists: false } }, { tagLine: null }] })
      .toArray();

    for (const destination of destinations) {
      await collection.updateOne(
        { _id: destination._id },
        { $set: { tagLine: destination.name } },
      );
    }
  },

  async down(db: Db): Promise<void> {
    await db
      .collection("destinations")
      .updateMany({}, { $unset: { tagLine: "" } });
  },
};
