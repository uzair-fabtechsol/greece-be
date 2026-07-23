import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Season, Status } from "@src/constants/enumConstants";

enum DestinationType {
  Island = "island",
  City = "city",
  Town = "town",
  Village = "village",
  CoastalTown = "coastal-town",
  MountainVillage = "mountain-village",
  Archipelago = "archipelago",
}

const destinationSchema = new Schema(
  {
    region: {
      type: Schema.Types.ObjectId,
      ref: "Region",
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
    type: {
      type: String,
      enum: Object.values(DestinationType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Draft,
    },
    quickFacts: {
      country: {
        type: String,
        required: true,
        trim: true,
      },
      language: {
        type: String,
        required: true,
        trim: true,
      },
      currency: {
        currencyName: {
          type: String,
          required: true,
          trim: true,
        },
        currencySign: {
          type: String,
          required: true,
          trim: true,
        },
      },
      timeZone: {
        type: String,
        required: true,
        trim: true,
      },
      bestSeason: {
        type: [String],
        enum: Object.values(Season),
        validate: {
          validator: (value: string[]) => value.length >= 1,
          message: "At least 1 best season is required",
        },
      },
    },
    about: {
      type: String,
      trim: true,
    },
    photoGallery: {
      type: [String],
      validate: {
        validator: (value: string[]) => value.length >= 5,
        message: "At least 5 photos are required",
      },
    },
  },
  {
    timestamps: true,
  },
);

type DestinationDocType = InferSchemaType<typeof destinationSchema>;

const DestinationModel =
  models.Destination ||
  model<DestinationDocType>("Destination", destinationSchema);

export default DestinationModel;
export type { DestinationDocType };
export { DestinationType };
