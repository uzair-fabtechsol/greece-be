import RegionModel from "@src/models/regionModel";
import DestinationModel from "@src/models/destinationModel";
import PlaceModel from "@src/models/placeModel";
import AppError from "@src/utils/appError";

export type Reference = {
  region: string | null;
  destination: string | null;
  place: string | null;
};

// FUNCTION
// Verifies whichever single reference (region/destination/place) was submitted
// exists, and returns all three with the other two nulled out.
export const resolveReference = async (body: {
  region?: string;
  destination?: string;
  place?: string;
}): Promise<Reference> => {
  if (body.place) {
    const place = await PlaceModel.findById(body.place);
    if (!place) {
      throw new AppError(404, "Place not found");
    }

    return { region: null, destination: null, place: place._id.toString() };
  }

  if (body.destination) {
    const destination = await DestinationModel.findById(body.destination);
    if (!destination) {
      throw new AppError(404, "Destination not found");
    }

    return {
      region: null,
      destination: destination._id.toString(),
      place: null,
    };
  }

  if (body.region) {
    const region = await RegionModel.findById(body.region);
    if (!region) {
      throw new AppError(404, "Region not found");
    }

    return { region: region._id.toString(), destination: null, place: null };
  }

  return { region: null, destination: null, place: null };
};
