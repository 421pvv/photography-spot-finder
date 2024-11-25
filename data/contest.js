import {
  contestRatings,
  contestSpots,
  contestSubmissions,
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
  submissionId = validation.submissionId(spotId, "id", true);
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

  const contestRatingsCollection = await contestRatings();
  const votes = await contestRatingsCollection
    .find({
      posterId: ObjectId.createFromHexString(userId),
      _id: ObjectId.createFromHexString(contenstSpotId),
    })
    .toArray();

  if (!votes.length) {
    return [];
  }

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
  if (vote !== -1 || vote !== 1) {
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

  ratingObject.reportCount = 0;

  let insertedSubmission;
  try {
    const contestSubmissionsCollection = await contestSubmissions();
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

export default {
  getContestSpotsList,
  getContestSpotsById,
  getSubmissionsForContestSpot,
  getContestSpotVotesByUser,
  getContestSubmissionByUser,
  getContestSubmissionById,
  putContestSubmissionVote,
  deleteContestSubmissionVote,
};
