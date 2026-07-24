import { model, models, Schema, type InferSchemaType } from "mongoose";
import { Status } from "@src/constants/enumConstants";
import {
  MIN_PLACE_IMAGES,
  MAX_PLACE_IMAGES,
  MAX_HERITAGE_ENTRIES,
  MAX_SUSTAINABILITY_NOTES,
  MAX_TIPS_AND_TRICKS,
} from "@src/constants/placeConstants";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  TAGLINE_MAX_LENGTH,
} from "@src/constants/limitConstants";

enum PlaceType {
  Beach = "beach",
  Viewpoint = "viewpoint",
  Landmark = "landmark",
  Village = "village",
  ArchaeologicalSite = "archaeologicalSite",
  Museum = "museum",
  Monastery = "monastery",
  Church = "church",
  Gorge = "gorge",
  Cave = "cave",
  NatureReserve = "natureReserve",
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
      minlength: NAME_MIN_LENGTH,
      maxlength: NAME_MAX_LENGTH,
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
      maxlength: TAGLINE_MAX_LENGTH,
    },
    type: {
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
        validator: (value: unknown[]) => value.length <= MAX_HERITAGE_ENTRIES,
        message: `At most ${MAX_HERITAGE_ENTRIES} heritage entries are allowed`,
      },
    },
    sustainabilityNotes: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) =>
          value.length <= MAX_SUSTAINABILITY_NOTES,
        message: `At most ${MAX_SUSTAINABILITY_NOTES} sustainability notes are allowed`,
      },
    },
    photoGallery: {
      type: [String],
      validate: {
        validator: (value: string[]) =>
          value.length >= MIN_PLACE_IMAGES && value.length <= MAX_PLACE_IMAGES,
        message: `At least ${MIN_PLACE_IMAGES} and at most ${MAX_PLACE_IMAGES} photos are required`,
      },
    },
    tipsAndTricks: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= MAX_TIPS_AND_TRICKS,
        message: `At most ${MAX_TIPS_AND_TRICKS} tips and tricks are allowed`,
      },
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
