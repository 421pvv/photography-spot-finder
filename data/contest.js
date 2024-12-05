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
  const submision = await getContestSubmissionById(contestSubmissionId);
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
  validation.validateObject(date);
  if (!(date instanceof Date) || isNaN(date) || date > new Date()) {
    throw ["Invalid date for rating."];
  }

  spotId = validation.validateString(spotId, "Spot id", true);
  await validateContestSpotSubmission(spotId);

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
  const contestSpotsList = await contestSpots();

  // Aggregate to find the top 3 spots by average rating
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
          totalRatings: { $sum: 1 },
          averageRating: { $avg: { $ifNull: ["$rating", 0] } },
        },
      },
      {
        $sort: { averageRating: -1 },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: "spots",
          localField: "spotId",
          foreignField: "_id",
          as: "spotDetails",
        },
      },
      {
        $unwind: "$spotDetails",
      },
    ])
    .toArray();

  await contestSpotsList.deleteMany({ contestInfo: currentMonth });

  const newTopSpots = topSpots.map((spot) => ({
    name: spot.spotDetails.name,
    location: spot.spotDetails.location,
    address: spot.spotDetails.address,
    description: spot.spotDetails.description,
    accessibility: spot.spotDetails.accessibility,
    bestTimes: spot.spotDetails.bestTimes,
    images: spot.spotDetails.images,
    tags: spot.spotDetails.tags,
    posterId: spot.spotDetails.posterId,
    createdAt: spot.spotDetails.createdAt,
    reportCount: spot.spotDetails.reportCount,
    averageRating: spot.averageRating,
    totalRatings: spot.totalRatings,
    contestInfo: currentMonth,
  }));

  if (newTopSpots.length > 0) {
    await contestSpotsList.insertMany(newTopSpots);
  }
};

const validateContestSpotSubmission = async (spotId) => {
  validation.validateString(spotId, "id", true);

  const spotInfo = await getContestSpotsById(spotId);
  if (!spotInfo) {
    throw ["Contest spot not found."];
  }

  const contestId = spotInfo.contestId;
  validation.validateString(contestId, "id", true);

  const contest = await getContestById(contestId);
  if (!contest) {
    throw ["No contest associated with this contest spot."];
  }

  const currentDate = new Date();
  const previousMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  const previousMonthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  );

  if (
    !(
      new Date(contest.startDate) >= previousMonthStart &&
      new Date(contest.startDate) <= previousMonthEnd
    )
  ) {
    throw ["Contest is not from the previous month."];
  }

  return spotInfo;
};

// Functions for Admin Panel (Submissions with report count greater than or equal to 20)
const getReportedContestSubmissions = async (userId) => {
  userId = validation.validateString(userId, "userId", true);
  const userInfo = await userData.getUserProfileById(userId);
  if (userInfo.role !== "admin") {
    throw ["The user is not an admin"];
  }
  let query = { reportCount: { $gte: 20 } };
  const contestSubmissionsCollection = await contestSubmissions();
  const reportedSubmissionsList = await contestSubmissionsCollection
    .find(query)
    .toArray();
  if (!reportedSubmissionsList) {
    throw ["Could not get reported contest submissions"];
  }
  return reportedSubmissionsList;
};

const deleteReportedContestSubmission = async (submissionId, userId) => {
  submissionId = validation.validateString(submissionId, "submissionId", true);
  const submissionInfo = await getContestSubmissionById(id);
  if (submissionInfo.reportCount < 20) {
    throw ["The submission has report count less than 20"];
  }
  userId = validation.validateString(userId, "userId", true);
  const userInfo = await userData.getUserProfileById(userId);
  if (userInfo.role !== "admin") {
    throw ["The user is not an admin"];
  }
  try {
    const contestSubmissionsCollection = await contestSubmissions();
    await contestSubmissionsCollection.deleteOne({
      _id: ObjectId.createFromHexString(submissionId),
    });
    const contestRatingsCollection = await contestRatings();
    await contestRatingsCollection.deleteMany({
      contestSubmissionId: ObjectId.createFromHexString(submissionId),
    });
  } catch (e) {
    throw ["Contest submission delete failed"];
  }
};

const clearContestSubmissionReports = async (submissionId, userId) => {
  submissionId = validation.validateString(submissionId, "submissionId", true);
  userId = validation.validateString(userId, "userId", true);
  const userInfo = await userData.getUserProfileById(userId);
  if (userInfo.role !== "admin") {
    throw ["The user is not an admin"];
  }
  const updateObj = { reportCount: 0 };
  const contestSubmissionsCollection = await contestSubmissions();
  const clearedSubmission = await contestSubmissionsCollection.findOneAndUpdate(
    {
      _id: ObjectId.createFromHexString(submissionId),
    },
    { $set: updateObj },
    { returnDocument: "after" }
  );
  if (!clearedSubmission) {
    throw ["Failed to clear reports of contest submission"];
  }
  return clearedSubmission;
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
  submitContestImage,
  validateContestSpotSubmission,
  getReportedContestSubmissions,
  updateTopContestSpots,
  deleteReportedContestSubmission,
  clearContestSubmissionReports,
};
