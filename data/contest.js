import { contestSpots , contestSubmissions } from "../config/mongoCollections.js"
import validation from "../validation.js"

const getContestSpotsList = async () => {
        const contestSpotsList = await contestSpots()
        if(!contestSpotsList){
            throw ['cannot get contest spots']
        }
        return await contestSpotsList.find({}).toArray();
}


const getContestSpotsById = async (spotId) => {
        spotId = validation.validateString(spotId, "id", true);
        const contestSpotsList = await contestSpots();
        const contenstSpotId = await contestSpotsList.findOne({
            _id: ObjectId.createFromHexString(id),
        })
          if (contenstSpotId === null) {
            throw [`No spot with id of ${id}`];
          }
          return spot;
}

const getSubmissionsForContestSpot = async (spotId) => {
      spotId = validateString(spotId , "id", true);
      const contestSpotsList = await contestSubmissions();
      const submissions = await contestSpotsList
        .aggregate([
          {
            $match: {
              contestSpotId: ObjectId.createFromHexString(spotId),
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "posterId",
              foreignField: "_id",
              as: "poster",
            },
          },
          {
            $unwind: "$poster",
          },
          {
            $project: {
              _id: 1,
              url: "$image.url",
              createdAt: 1,
              firstName: "$poster.firstName",
              lastName: "$poster.lastName",
              username: "$poster.username",
            },
          },
        ])
        .toArray();
  
      if (!submissions.length) {
        throw ["No submissions found for the given contest spot."];
      }
  
      return submissions.map((submission) => ({
        ...submission,
        createdAt: new Date(submission.createdAt).toString(),
      }));
};
  
// const insertContestSubmission = async (submission) => {
//     let 
// }
  

export default {
    getContestSpotsList,
    getContestSpotsById,
    getSubmissionsForContestSpot,
  };
  

