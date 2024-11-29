import {
  contestRatings,
  contestSpots,
  contestSubmissions,
  spotRatings,
} from "../config/mongoCollections.js";
import validation from "../validation.js";
import logger from "../log.js";
import { ObjectId } from "mongodb";
import { userData } from "./index.js";

const getContestSpotsList = async () => {
  const contestSpotsList = await contestSpots();
  if (!contestSpotsList) {
    throw ["cannot get contest spots"];
  }
  return await contestSpotsList.find({}).toArray();
};

const getContestSpotsById = async (spotId) => {
  spotId = validation.validateString(spotId, "id", true);
  const contestSpotsList = await contestSpots();
  const contenstSpotId = await contestSpotsList.findOne({
    _id: ObjectId.createFromHexString(spotId),
  });
  if (!contenstSpotId) {
    logger.log("Cannot find contest spot, ", contenstSpotId);
    throw [`No spot with id of ${spotId}`];
  }
  return contenstSpotId;
};

const getSubmissionsForContestSpot = async (spotId) => {
  spotId = validation.validateString(spotId, "id", true);
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
          posterId: "$poster._id",
          firstName: "$poster.firstName",
          lastName: "$poster.lastName",
          username: "$poster.username",
        },
      },
    ])
    .toArray();

  if (!submissions.length) {
    return [];
  }

  return submissions.map((submission) => ({
    ...submission,
    createdAt: new Date(submission.createdAt).toString(),
  }));
};

const getContestSubmissionById = async (submissionId) => {
  submissionId = validation.validateString(submissionId, "id", true);
  const contestSubmissionsCollection = await contestSubmissions();
  const submission = await contestSubmissionsCollection.findOne({
    _id: ObjectId.createFromHexString(submissionId),
  });

  if (!submission) {
    throw [`No contest image submission with id: ${submissionId}`];
  }

  return submission;
};

const getContestSubmissionByUser = async (contestSpotId, posterId) => {
  contestSpotId = validation.validateString(contestSpotId, "id", true);
  await getContestSpotsById(contestSpotId);

  posterId = validation.validateString(posterId, "User id", true);
  const userInfo = userData.getUserProfileById(posterId);

  const contestSubmissionsCollection = await contestSubmissions();
  const submission = await contestSubmissionsCollection.findOne({
    posterId: ObjectId.createFromHexString(posterId),
    contestSpotId: ObjectId.createFromHexString(contestSpotId),
  });

  if (!submission) {
    throw [
      `No contest image submission by user ${posterId} for contest spot: ${contestSpotId}`,
    ];
  }

  return submission;
};

const getContestSpotVotesByUser = async (userId, contenstSpotId) => {
  userId = validation.validateString(userId, "User Id", true);
  contenstSpotId = validation.validateString(
    contenstSpotId,
    "Contest Spot Id",
    true
  );
  logger.log("user id: ", userId, "contest spot id: ", contenstSpotId);
  const contestRatingsCollection = await contestRatings();
  const votes = await contestRatingsCollection
    .aggregate([
      {
        $lookup: {
          from: "contestSubmissions",
          localField: "contestSubmissionId",
          foreignField: "_id",
          as: "contestSubmission",
        },
      },
      {
        $unwind: {
          path: "$contestSubmission",
        },
      },
      {
        $project: {
          _id: 1,
          contestSubmissionId: 1,
          posterId: 1,
          createdAt: 1,
          vote: 1,
          contestSpotId: "$contestSubmission.contestSpotId",
        },
      },
      {
        $match: {
          posterId: ObjectId.createFromHexString(userId),
          contestSpotId: ObjectId.createFromHexString(contenstSpotId),
        },
      },
    ])
    .toArray();

  if (!votes.length) {
    return [];
  }
  logger.log(votes);
  return votes;
};

const putContestSubmissionVote = async (
  contestSubmissionId,
  vote,
  posterId,
  date
) => {
  const ratingObject = {};
  contestSubmissionId = validation.validateString(
    contestSubmissionId,
    "Spot Id",
    true
  );
  const contestSubmission = await getContestSubmissionById(contestSubmissionId);
  ratingObject.contestSubmissionId =
    ObjectId.createFromHexString(contestSubmissionId);

  validation.validateNumber(vote, "Vote");
  if (vote !== -1 && vote !== 1) {
    throw [`Vote must be -1 or 1`];
  }
  ratingObject.vote = vote;

  posterId = validation.validateString(posterId, "Posting User Id", true);
  const userInfo = await userData.getUserProfileById(posterId);
  ratingObject.posterId = ObjectId.createFromHexString(userInfo._id.toString());

  validation.validateObject(date);
  if (!(date instanceof Date) || isNaN(date) || date > new Date()) {
    throw ["Invalid date for rating."];
  }
  ratingObject.createdAt = date;

  let insertedSubmission;
  try {
    const contestSubmissionsCollection = await contestRatings();
    insertedSubmission = await contestSubmissionsCollection.findOneAndUpdate(
      {
        $and: [
          { contestSubmissionId: ratingObject.contestSubmissionId },
          { posterId: ratingObject.posterId },
        ],
      },
      { $set: ratingObject },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    await updateTopContestSpots();

    return insertedSubmission;
  } catch (e) {
    logger.log(e);
    throw [`Contest submission vote failed!`];
  }
};

const deleteContestSubmissionVote = async (contestSubmissionId, posterId) => {
  contestSubmissionId = validation.validateString(
    contestSubmissionId,
    "Contest Submission Id",
    true
  );
  const contestSubmission = await getContestSubmissionById(contestSubmissionId);

  posterId = validation.validateString(posterId, "Posting User Id", true);
  const userInfo = await userData.getUserProfileById(posterId);

  const contestRatingsCollection = await contestRatings();
  await contestRatingsCollection.deleteOne({
    posterId: ObjectId.createFromHexString(posterId),
    contestSubmissionId: ObjectId.createFromHexString(contestSubmissionId),
  });
};

const submitContestImage = async (url, public_id, userId, spotId, date) => {
  //TODO: check if it's valid to still submit for this contest spot

  validation.validateObject(date);
  if (!(date instanceof Date) || isNaN(date) || date > new Date()) {
    throw ["Invalid date for rating."];
  }

  spotId = validation.validateString(spotId, "Spot id", true);
  let spotInfo = await getContestSpotsById(spotId);

  userId = validation.validateString(userId, "User Id", true);
  let userInfo = await userData.getUserProfileById(userId);

  const submissionImage = {};
  submissionImage.url = validation.validateString(url, "Image Url");
  submissionImage.public_id = validation.validateString(
    public_id,
    "Image Public Id"
  );

  const contestSubmissionsCollection = await contestSubmissions();
  const result = await contestSubmissionsCollection.insertOne({
    contestSpotId: ObjectId.createFromHexString(spotId),
    image: submissionImage,
    posterId: ObjectId.createFromHexString(userId),
    createdAt: date,
    reportCount: 0,
  });
  const submision = await contestSubmissionsCollection.findOne({
    _id: ObjectId.createFromHexString(result.insertedId.toString()),
  });
  return submision;
};

const updateTopContestSpots = async () => {
  const current = new Date();
  const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1);

  const spotsRatingsList = await spotRatings();
  const contestSpotsList = new contestSpots();

  const topSpots = await spotsRatingsList
    .aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth },
        },
      },
      {
        $group: {
          _id: "$spotId",
          totalVotes: { $sum: "$rating" },
        },
      },
      {
        $sort: { totalVotes: -1 },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: "contestSpots",
          localField: "_id",
          foreignField: "_id",
          as: "spotsDetails",
        },
      },
      {
        $project: {
          _id: 1,
          totalVotes: 1,
          spotDetails: { $arrayElemAt: ["$spotDetails", 0] },
        },
      },
    ])
    .toArray();

  await contestSpotsList.updateOne(
    { month: currentMonth },
    { $set: { topSpots } },
    { upsert: true }
  );
};

// const canSubmit = async (contestId, submisson) => {
//   const current = new Date()

//   const contestSpotsList = await con
// }

export default {
  getContestSpotsList,
  getContestSpotsById,
  getSubmissionsForContestSpot,
  getContestSpotVotesByUser,
  getContestSubmissionByUser,
  getContestSubmissionById,
  putContestSubmissionVote,
  deleteContestSubmissionVote,
  submitContestImage,
};
