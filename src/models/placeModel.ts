import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Status } from "@src/constants/enumConstants";

enum PlaceType {
  Beach = "beach",
  Viewpoint = "viewpoint",
  Landmark = "landmark",
  Village = "village",
  ArchaeologicalSite = "archaeological-site",
  Museum = "museum",
  Monastery = "monastery",
  Church = "church",
  Gorge = "gorge",
  Cave = "cave",
  NatureReserve = "nature-reserve",
  Mountain = "mountain",
  Lake = "lake",
  Waterfall = "waterfall",
  Harbor = "harbor",
  Market = "market",
}

const placeSchema = new Schema(
  {
    destination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    tagLine: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    placeType: {
      type: String,
      enum: Object.values(PlaceType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Draft,
    },
    about: {
      type: String,
      trim: true,
    },
    heritage: {
      type: [
        {
          image: {
            type: String,
            required: true,
            trim: true,
          },
          historicalFact: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
      validate: {
        validator: (value: unknown[]) => value.length <= 10,
        message: "At most 10 heritage entries are allowed",
      },
    },
    sustainabilityNotes: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 10,
        message: "At most 10 sustainability notes are allowed",
      },
    },
    photoGallery: {
      type: [String],
      validate: {
        validator: (value: string[]) => value.length >= 5,
        message: "At least 5 photos are required",
      },
    },
    tipsAndTricks: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

type PlaceDocType = InferSchemaType<typeof placeSchema>;

const PlaceModel = models.Place || model<PlaceDocType>("Place", placeSchema);

export default PlaceModel;
export type { PlaceDocType };
export { PlaceType };
