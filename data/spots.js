import {
  spots,
  comments,
  spotRatings,
  users,
} from "../config/mongoCollections.js";
import validation from "../validation.js";
import { ObjectId } from "mongodb";
import { userData, cloudinaryData, contestData } from "./index.js";
import logger from "../log.js";
import log from "../log.js";

const createSpot = async (
  name,
  location,
  address,
  description,
  accessibility,
  bestTimes,
  images,
  tags,
  posterId,
  createdAt
) => {
  name = validation.validateString(name, "Name");
  address = validation.validateString(address, "Address");
  description = validation.validateString(description, "Description");
  accessibility = validation.validateString(accessibility, "Accessibility");
  posterId = validation.validateString(posterId, "Poster ID", true);
  await userData.getUserProfileById(posterId);
  posterId = ObjectId.createFromHexString(posterId);

  validation.validateArray(bestTimes, "Best Times");
  if (bestTimes.length == 0) throw [`Must provide at least one best time!`];
  for (const tagI in bestTimes) {
    bestTimes[tagI] = validation.validateString(bestTimes[tagI]).toLowerCase();
  }

  validation.validateArray(tags, "tags");
  if (tags.length > 0) {
    for (const tagI in tags) {
      tags[tagI] = validation.validateString(tags[tagI], "tag").toLowerCase();
    }
  }
  if (Array.isArray(tags) && tags.length > 5) {
    throw `A maximum of five tags is allowed`;
  }

  validation.validateObject(location, "Location");
  validation.validateCoordinates(...location.coordinates);

  validation.validateArray(images, "images");
  for (const image of images) {
    validation.validateObject(image, "image");
    if (!image.public_id || !image.url) {
      throw ["Missing image object attributes"];
    }
    validation.validateString(image.public_id);
    validation.validateString(image.url);
  }
  if (images.length === 0 || images.length > 3) {
    throw [`Invalid number of images!`];
  }

  if (
    !createdAt ||
    typeof createdAt !== "object" ||
    !(createdAt instanceof Date) ||
    createdAt > new Date()
  ) {
    throw [`Expected createdAt to be a Date object, but it's not`];
  }

  const create_new_spot = {
    name,
    location,
    address,
    description,
    accessibility,
    bestTimes,
    images,
    tags,
    posterId,
    createdAt,
    reportCount: 0,
    averageRating: 0,
    totalRatings: 0,
  };

  const spotsCollection = await spots();
  const insertInfo = await spotsCollection.insertOne(create_new_spot);
  if (!insertInfo.acknowledged || !insertInfo.insertedId.toString())
    throw "Could not add spot";
  const spotId = insertInfo.insertedId.toString();
  const spot = await getSpotById(spotId);
  return spot;
};

const getSpotsByDistance = async (distance, long, lat) => {
  validation.validateNumber(distance);
  if (distance < 0) {
    throw `Distance cannot be negative!`;
  }

  validation.validateCoordinates(long, lat);

  distance = 1609.34 * distance; // convert from miles to meters
  logger.log("Querying for spots in radius", distance);
  const spotsCollection = await spots();
  const allSpotsList = await spotsCollection
    .find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [long, lat] },
          $minDistance: 0,
          $maxDistance: distance,
        },
      },
    })
    .toArray();
  if (!allSpotsList) {
    throw ["Spots search by distance failed!"];
  }
  const allSpots = allSpotsList.filter((spot) => spot.reportCount < 20);
  return allSpots;
};

// gets all spots with report count less than 20 and with the given filters (if filters are ptovided)
const getAllSpots = async (keyword, filter) => {
  logger.log("Getting all spots with query: ");
  logger.log(keyword, filter);

  let query = { $and: [{ reportCount: { $lt: 20 } }] };
  if (keyword) {
    keyword = validation.validateString(keyword, "keyword", false);
    const searchRegex = new RegExp("^.*" + keyword + ".*$", "i");
    const keywordQuery = {
      $or: [
        { name: searchRegex },
        { accessibility: searchRegex },
        { bestTimes: { $elemMatch: { $regex: searchRegex } } },
      ],
    };
    query.$and.push(keywordQuery);
  }
  if (filter.tag) {
    if (!Array.isArray(filter.tag)) {
      throw ["tags is not an array"];
    }
    if (filter.tag.length === 0) {
      throw ["tags is empty"];
    }
    filter.tag = filter.tag.map((tag) =>
      validation.validateString(tag, "tag", false).toLowerCase()
    );
    const tagQuery = { tags: { $all: filter.tag } };
    query.$and.push(tagQuery);
  }
  if (filter.minRating) {
    validation.validateRating(filter.minRating);
    const ratingQuery = { averageRating: { $gte: filter.minRating } };
    query.$and.push(ratingQuery);
  }
  if (filter.fromDate && filter.toDate) {
    if (
      !(filter.fromDate instanceof Date) ||
      !(filter.toDate instanceof Date)
    ) {
      throw ["Both fromDate and toDate must be valid Date objects."];
    }
    if (filter.fromDate > filter.toDate) {
      throw ["The fromDate must not be later than the endDate."];
    }
    const fromDateQuery = { createdAt: { $gte: filter.fromDate } };
    const toDateQuery = { createdAt: { $lte: filter.toDate } };
    query.$and.push(fromDateQuery);
    query.$and.push(toDateQuery);
  } else if (filter.fromDate) {
    if (!(filter.fromDate instanceof Date)) {
      throw ["fromDate and toDate must be valid Date object."];
    }
    const fromDateQuery = { createdAt: { $gte: filter.fromDate } };
    query.$and.push(fromDateQuery);
  } else if (filter.toDate) {
    if (!(filter.toDate instanceof Date)) {
      throw ["toDate must be valid Date object."];
    }
    const toDateQuery = { createdAt: { $lte: filter.toDate } };
    query.$and.push(toDateQuery);
  }
  const spotsCollection = await spots();
  const allSpotsList = await spotsCollection.find(query).toArray();
  if (!allSpotsList) {
    throw ["Could not get all spots"];
  }
  return allSpotsList;
};

// takes id as a string parameter and returns the spot with that id
const getSpotById = async (id) => {
  id = validation.validateString(id, "id", true);
  const spotsCollection = await spots();
  const spot = await spotsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (spot === null) {
    throw [`No spot with id of ${id}`];
  }
  return spot;
};

const updateSpot = async (spotId, userId, updateSpotObj) => {
  let name = updateSpotObj.name;
  let location = updateSpotObj.location;
  let address = updateSpotObj.address;
  let description = updateSpotObj.description;
  let accessibility = updateSpotObj.accessibility;
  let bestTimes = updateSpotObj.bestTimes;
  let tags = updateSpotObj.tags;
  let images = updateSpotObj.images;

  const updateObject = {};

  spotId = validation.validateString(spotId, "Spot Id", true);
  const curSpot = await getSpotById(spotId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);

  if (userId.toString() !== curSpot.posterId.toString()) {
    throw [`Invalid spot update attempt. User is not the original poster!`];
  }

  if (name) {
    name = validation.validateString(name, "Name");
    updateObject.name = name;
  }
  if (address) {
    address = validation.validateString(address, "Address");
    updateObject.address = address;
  }
  if (description) {
    description = validation.validateString(description, "Description");
    updateObject.description = description;
  }
  if (accessibility) {
    accessibility = validation.validateString(accessibility, "Accessibility");
    updateObject.accessibility = accessibility;
  }

  if (bestTimes) {
    validation.validateArray(bestTimes, "Best Times");
    if (bestTimes.length == 0) throw [`Must provide at least one best time!`];
    for (const tagI in bestTimes) {
      bestTimes[tagI] = validation
        .validateString(bestTimes[tagI])
        .toLowerCase();
    }
    updateObject.bestTimes = bestTimes;
  }

  if (tags) {
    validation.validateArray(tags, "tags");
    if (tags.length > 0) {
      for (const tagI in tags) {
        tags[tagI] = validation.validateString(tags[tagI], "tag").toLowerCase();
      }
    }
    if (Array.isArray(tags) && tags.length > 5) {
      throw `A maximum of five tags is allowed`;
    }
    updateObject.tags = tags;
  }

  if (location) {
    validation.validateObject(location, "Location");
    validation.validateCoordinates(...location.coordinates);
    updateObject.location = {
      type: "Point",
      coordinates: location.coordinates,
    };
  }

  if (images) {
    validation.validateArray(images, "images");
    for (const image of images) {
      validation.validateObject(image, "image");
      if (!image.public_id || !image.url) {
        throw ["Missing image object attributes"];
      }
      validation.validateString(image.public_id);
      validation.validateString(image.url);
    }
    if (images.length === 0 || images.length > 3) {
      throw [`Invalid number of images!`];
    }
    updateObject.images = images;
  }

  if (Object.keys(updateObject).length === 0) {
    throw [`Must provide at lead one update field for spot edit!`];
  }
  try {
    const spotsCollection = await spots();
    await spotsCollection.updateOne(
      {
        _id: ObjectId.createFromHexString(spotId),
      },
      {
        $set: updateObject,
      }
    );
  } catch (e) {
    throw [`Spot update failed!`];
  }

  const spot = await getSpotById(spotId);

  const currentImages = spot.images.map((image) => image.public_id);
  const orphanImages = [];
  for (const orphanImage of curSpot.images) {
    if (currentImages.indexOf(orphanImage.public_id) === -1) {
      orphanImages.push(orphanImage.public_id);
    }
  }
  await cloudinaryData.deleteImages(orphanImages);
  return spot;
};

const deleteSpot = async (spotId, userId) => {
  spotId = validation.validateString(spotId, "Spot Id", true);
  const curSpot = await getSpotById(spotId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);

  if (userId.toString() !== curSpot.posterId.toString()) {
    throw [`Invalid spot update attempt. User is not the original poster!`];
  }

  try {
    const spotsCollection = await spots();
    await spotsCollection.deleteOne({
      _id: ObjectId.createFromHexString(spotId),
    });

    // deleting spot's ratings and comments
    let commentImages = [];
    const commentsCollection = await comments();
    const commentsImageData = await commentsCollection
      .find(
        { spotId: ObjectId.createFromHexString(spotId) },
        { projection: { _id: 0, image: 1 } }
      )
      .toArray();

    for (const imageData of commentsImageData) {
      if (imageData.image !== null) {
        commentImages.push(imageData.image.public_id);
      }
    }

    await cloudinaryData.deleteImages(commentImages);

    await commentsCollection.deleteMany({
      spotId: ObjectId.createFromHexString(spotId),
    });

    const ratingsCollection = await spotRatings();
    await ratingsCollection.deleteMany({
      spotId: ObjectId.createFromHexString(spotId),
    });
  } catch (e) {
    throw [`Spot deletion failed!`];
  }

  // delete all images from cloud
  const orphanImages = curSpot.images.map((image) => image.public_id);
  await cloudinaryData.deleteImages(orphanImages);

  return curSpot;
};

const getCommentById = async (id) => {
  id = validation.validateString(id, "Comment Id", true);
  const commentsCollection = await comments();
  const comment = await commentsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (!comment) {
    throw [`No comment exists with id: ${id}`];
  }
  return comment;
};

const getCommentsBySpotId = async (id) => {
  id = validation.validateString(id, "Comment Id", true);
  const commentsCollection = await comments();
  let spotComments;
  try {
    spotComments = await commentsCollection
      .find({
        spotId: ObjectId.createFromHexString(id),
      })
      .toArray();
  } catch (e) {
    throw ["Comments fetch failed for spot: " + id.toString()];
  }
  logger.log("Comments fetched: " + id.toString());
  logger.log(spotComments);
  return spotComments;
};

const getDisplayCommentsBySpotId = async (id) => {
  id = validation.validateString(id, "Comment Id", true);
  const commentsCollection = await comments();
  let spotComments;
  try {
    spotComments = await commentsCollection
      .aggregate([
        {
          $match: {
            spotId: ObjectId.createFromHexString(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "posterId",
            foreignField: "_id",
            as: "poster",
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  username: 1,
                  _id: 1,
                },
              },
            ],
          },
        },
      ])
      .toArray();
  } catch (e) {
    throw ["Comments fetch failed for spot: " + id.toString()];
  }
  logger.log("Comments fetched: " + id.toString());
  logger.log(spotComments);
  spotComments = spotComments.filter((comment) => comment.reportCount < 20);
  return spotComments;
};

const addComment = async (spotId, userId, message, createdAt, image) => {
  const commentObject = {};
  spotId = validation.validateString(spotId, "Spot Id", true);
  const spot = await getSpotById(spotId);
  commentObject.spotId = ObjectId.createFromHexString(spotId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);
  commentObject.posterId = ObjectId.createFromHexString(
    userInfo._id.toString()
  );

  message = validation.validateString(message, "Message");
  commentObject.message = message;

  if (typeof createdAt !== "object" && !(createdAt instanceof Date)) {
    throw ["Comment createdAt timestamp is invalid"];
  }
  commentObject.createdAt = createdAt;

  if (image) {
    validation.validateObject(image);
    if (!image.public_id || !image.url) {
      throw [`Invalid image object.`];
    }
    validation.validateString(image.public_id);
    validation.validateString(image.url);
    commentObject.image = {
      public_id: image.public_id,
      url: image.url,
    };
  } else {
    commentObject.image = null;
  }
  commentObject.reportCount = 0;

  let commentResult;
  try {
    const commentsCollection = await comments();
    commentResult = await commentsCollection.insertOne(commentObject);
  } catch (e) {
    throw [`Comment submision failed!`];
  }

  return getCommentById(commentResult.insertedId.toString());
};

const updateComment = async (commentId, userId, message, image) => {
  const commentObject = {};
  commentId = validation.validateString(commentId, "Comment Id", true);
  const comment = await getCommentById(commentId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);

  if (comment.posterId.toString() !== userInfo._id.toString()) {
    throw [`Attempting to update a comment that doesn't beling to the user.!`];
  }

  message = validation.validateString(message, "Message");
  commentObject.message = message;

  if (image) {
    validation.validateObject(image, "Image");
    if (!image.public_id || !image.url) {
      throw [`Invalid image object.`];
    }
    validation.validateString(image.public_id);
    validation.validateString(image.url);
    commentObject.image = {
      public_id: image.public_id,
      url: image.url,
    };
  } else {
    commentObject.image = null;
  }

  try {
    const commentsCollectin = await comments();
    await commentsCollectin.updateOne(
      {
        _id: ObjectId.createFromHexString(commentId),
        posterId: ObjectId.createFromHexString(userId),
      },
      {
        $set: commentObject,
      }
    );
  } catch (e) {
    throw [`Comment update failed!`];
  }
  const newComment = await getCommentById(commentId);
  if (
    newComment.image &&
    comment.image &&
    newComment.image.public_id !== comment.image.public_id
  ) {
    await cloudinaryData.deleteImages([comment.image.public_id]);
  } else if (comment.image && !newComment.image) {
    await cloudinaryData.deleteImages([comment.image.public_id]);
  }
  return newComment;
};

const deleteComment = async (commentId, userId) => {
  commentId = validation.validateString(commentId, "Comment Id", true);
  const comment = await getCommentById(commentId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);

  if (comment.posterId.toString() !== userInfo._id.toString()) {
    throw [
      `Attempting to delete a comment but user is the original commenter!`,
    ];
  }

  try {
    const commentsCollection = await comments();
    await commentsCollection.deleteOne({
      _id: ObjectId.createFromHexString(commentId),
      posterId: ObjectId.createFromHexString(userId),
    });
  } catch (e) {
    throw [`Delete comment failed`];
  }

  // delete image form cloud
  if (comment.image) {
    await cloudinaryData.deleteImages([comment.image.public_id]);
  }
  return comment;
};

const putSpotRating = async (spotId, userId, rating, date) => {
  const ratingObject = {};
  spotId = validation.validateString(spotId, "Spot Id", true);
  const spot = await getSpotById(spotId);
  ratingObject.spotId = ObjectId.createFromHexString(spotId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);
  ratingObject.posterId = ObjectId.createFromHexString(userInfo._id.toString());

  validation.validateNumber(rating, "Rating");
  if (rating < 1 || rating > 10) {
    throw [`Rating must be between 1 and 10 (inclusive)!`];
  }
  ratingObject.rating = rating;

  validation.validateObject(date);
  if (!(date instanceof Date) || isNaN(date) || date > new Date()) {
    throw ["Invalid date for rating."];
  }
  ratingObject.createdAt = date;

  let insertedRating;
  try {
    const spotRatingsCollection = await spotRatings();
    insertedRating = await spotRatingsCollection.findOneAndUpdate(
      {
        $and: [
          { spotId: ratingObject.spotId },
          { posterId: ratingObject.posterId },
        ],
      },
      { $set: ratingObject },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    await updateSpotAggregateStatistics(spotId);

    return insertedRating;
  } catch (e) {
    logger.log(e);
    throw [`Rating submision failed!`];
  } finally {
    await contestData.updateTopContestSpots();
  }
};

const getSpotRatingByUserId = async (spotId, userId) => {
  spotId = validation.validateString(spotId, "Spot Id", true);
  userId = validation.validateString(userId, "User Id", true);

  const ratingsCollection = await spotRatings();
  const rating = await ratingsCollection.findOne({
    spotId: ObjectId.createFromHexString(spotId),
    posterId: ObjectId.createFromHexString(userId),
  });
  if (!rating) {
    throw [`Used ${userId} has not rated spot ${spotId}`];
  }
  return rating;
};

const getRatingById = async (id) => {
  id = validation.validateString(id, "Rating Id", true);
  const ratingsCollection = await spotRatings();
  const rating = await ratingsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (!rating) {
    throw [`No rating exists with id: ${id}`];
  }
  return rating;
};

const getRatingsBySpotId = async (id) => {
  id = validation.validateString(id, "Spot Id", true);
  const ratingsCollection = await spotRatings();
  let spotRatingsData;
  try {
    spotRatingsData = await ratingsCollection
      .find({
        spotId: ObjectId.createFromHexString(id),
      })
      .toArray();
  } catch (e) {
    throw ["Ratings fetch failed for spot: " + id.toString()];
  }
  logger.log("Ratings fetched: " + id.toString());
  logger.log(spotRatingsData);
  return spotRatingsData;
};

const deleteRating = async (ratingId, userId) => {
  ratingId = validation.validateString(ratingId, "Rating Id", true);
  const currentRating = await getRatingById(ratingId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);

  if (currentRating.posterId.toString() !== userId) {
    throw [`Attempting to delete another user's rating`];
  }
  let insertedRating;
  try {
    const spotRatingsCollection = await spotRatings();
    insertedRating = await spotRatingsCollection.findOneAndDelete(
      {
        _id: ObjectId.createFromHexString(ratingId),
      },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    // update spots ratings
    logger.log("deleting rating", insertedRating);
    await updateSpotAggregateStatistics(currentRating.spotId.toString());
    return insertedRating;
  } catch (e) {
    logger.log(e);
    throw [`Rating removal failed!`];
  }
};

const updateSpotAggregateStatistics = async (spotId) => {
  validation.validateString(spotId, "Spot Id", true);
  await getSpotById(spotId);

  const spotRatingsCollection = await spotRatings();
  let updatedRatings = await spotRatingsCollection
    .aggregate([
      {
        $match: {
          spotId: ObjectId.createFromHexString(spotId),
        },
      },
      {
        $group: {
          _id: "$spotId",
          totalRatings: { $sum: 1 },
          averageRating: { $avg: { $ifNull: ["$rating", 0] } },
        },
      },
    ])
    .toArray();

  let totalRatings = 0;
  let averageRating = 0;

  if (updatedRatings.length > 0) {
    updatedRatings = updatedRatings[0];

    totalRatings = updatedRatings.totalRatings;
    averageRating = Number(updatedRatings.averageRating.toFixed(2));

    if (
      !updatedRatings ||
      updatedRatings.averageRating == null ||
      updatedRatings.averageRating === undefined
    ) {
      averageRating = 0;
    }
    if (
      !updatedRatings ||
      updatedRatings.totalRatings == null ||
      updatedRatings.totalRatings === undefined
    ) {
      totalRatings = 0;
    }
  }
  const spotsCollection = await spots();
  await spotsCollection.updateOne(
    {
      _id: ObjectId.createFromHexString(spotId),
    },
    {
      $set: {
        averageRating: averageRating,
        totalRatings: totalRatings,
      },
    }
  );
};

// Functions for admin panel (Spots and comments with report count greater than or equal to 20)
const getReportedSpots = async (userId) => {
  userId = validation.validateString(userId, "userId", true);
  const userInfo = await userData.getUserProfileById(userId);
  if (userInfo.role !== "admin") {
    throw ["The user is not an admin"];
  }
  let query = { reportCount: { $gte: 20 } };
  const spotsCollection = await spots();
  const reportedSpotsList = await spotsCollection.find(query).toArray();
  if (!reportedSpotsList) {
    throw ["Could not get reported spots"];
  }
  for (let i = 0; i < reportedSpotsList.length; i++) {
    const user = await userData.getUserProfileById(
      reportedSpotsList[i].posterId.toString()
    );
    reportedSpotsList[i].posterUsername = user.username;
    reportedSpotsList[i].posterFullName = `${user.firstName} ${user.lastName}`;
  }
  // reportedSpotsList = reportedSpotsList.map(async (reportedSpot) => {
  //   const user = await userData.getUserProfileById(
  //     reportedSpot.posterId.toString()
  //   );
  //   reportedSpot.posterUsername = user.username;
  // });

  return reportedSpotsList;
};

const deleteReportedSpot = async (spotId, userId) => {
  spotId = validation.validateString(spotId, "spotId", true);
  const spotInfo = await getSpotById(spotId);
  if (spotInfo.reportCount < 20) {
    throw ["The spot has report count less than 20"];
  }
  userId = validation.validateString(userId, "userId", true);
  const userInfo = await userData.getUserProfileById(userId);
  if (userInfo.role !== "admin") {
    throw ["The user is not an admin"];
  }
  const deletedSpot = await deleteSpot(spotId, spotInfo.posterId.toString());
  const usersCollection = await users();
  await usersCollection.updateMany({}, { $pull: { spotReports: spotId } });
  return deletedSpot;
};

const clearSpotReports = async (spotId, userId) => {
  spotId = validation.validateString(spotId, "spotId", true);
  userId = validation.validateString(userId, "userId", true);
  const userInfo = await userData.getUserProfileById(userId);
  if (userInfo.role !== "admin") {
    throw ["The user is not an admin"];
  }
  const updateObj = { reportCount: 0 };
  const spotsCollection = await spots();
  const clearedSpot = await spotsCollection.findOneAndUpdate(
    {
      _id: ObjectId.createFromHexString(spotId),
    },
    {
      $set: updateObj,
    },
    {
      returnDocument: "after",
    }
  );
  if (!clearedSpot) {
    throw ["Spot Report clearing failed"];
  }
  const usersCollection = await users();
  await usersCollection.updateMany({}, { $pull: { spotReports: spotId } });
  return clearedSpot;
};

const getReportedComments = async (userId) => {
  userId = validation.validateString(userId, "userId", true);
  const userInfo = await userData.getUserProfileById(userId);
  if (userInfo.role !== "admin") {
    throw ["The user is not an admin"];
  }
  let query = { reportCount: { $gte: 20 } };
  const commentsCollection = await comments();
  const reportedCommentsList = await commentsCollection.find(query).toArray();
  if (!reportedCommentsList) {
    throw ["Could not get reported comments"];
  }
  for (let i = 0; i < reportedCommentsList.length; i++) {
    const user = await userData.getUserProfileById(
      reportedCommentsList[i].posterId.toString()
    );
    reportedCommentsList[i].posterUsername = user.username;
    reportedCommentsList[
      i
    ].posterFullName = `${user.firstName} ${user.lastName}`;
  }
  return reportedCommentsList;
};

const deleteReportedComment = async (commentId, userId) => {
  commentId = validation.validateString(commentId, "commentId", true);
  const commentInfo = await getCommentById(commentId);
  if (commentInfo.reportCount < 20) {
    throw ["The comment has report count less than 20"];
  }
  userId = validation.validateString(userId, "userId", true);
  const userInfo = await userData.getUserProfileById(userId);
  if (userInfo.role !== "admin") {
    throw ["The user is not an admin"];
  }
  const deletedComment = await deleteComment(
    commentId,
    commentInfo.posterId.toString()
  );
  const usersCollection = await users();
  await usersCollection.updateMany(
    {},
    { $pull: { commentReports: commentId } }
  );
  return deletedComment;
};

const clearCommentReports = async (commentId, userId) => {
  commentId = validation.validateString(commentId, "commentId", true);
  userId = validation.validateString(userId, "userId", true);
  const userInfo = await userData.getUserProfileById(userId);
  if (userInfo.role !== "admin") {
    throw ["The user is not an admin"];
  }
  const updateObj = { reportCount: 0 };
  const commentsCollection = await comments();
  const clearedComment = await commentsCollection.findOneAndUpdate(
    {
      _id: ObjectId.createFromHexString(commentId),
    },
    {
      $set: updateObj,
    },
    {
      returnDocument: "after",
    }
  );
  if (!clearedComment) {
    throw ["Comment Report clearing failed"];
  }
  const usersCollection = await users();
  await usersCollection.updateMany(
    {},
    { $pull: { commentReports: commentId } }
  );
  return clearedComment;
};

const getLastMonthTopSpots = async () => {
  const current = new Date();
  const lastMonthStart = new Date(
    current.getFullYear(),
    current.getMonth() - 1,
    1
  );
  const currentMonthStart = new Date(
    current.getFullYear(),
    current.getMonth(),
    1
  );

  const spotsRatingsList = await spotRatings();

  // Aggregate to find the top 3 spots by average rating
  const topSpots = await spotsRatingsList
    .aggregate([
      {
        $match: {
          createdAt: {
            $gte: lastMonthStart,
            $lt: currentMonthStart,
          },
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
        $match: {
          totalRatings: {
            $gte: 5,
          },
          averageRating: {
            $gte: 7.5,
          },
        },
      },
      {
        $sort: { averageRating: -1, totalRatings: -1 },
      },
      {
        $lookup: {
          from: "spots",
          localField: "_id",
          foreignField: "_id",
          as: "spotDetails",
        },
      },
      {
        $unwind: "$spotDetails",
      },
      {
        $limit: 3,
      },
    ])
    .toArray();
  logger.log("Top spots: ", topSpots);

  // const newTopSpots = topSpots.map((spot) => {
  //   return {
  //     _id: spot.spotDetails._id,
  //     name: spot.spotDetails.name,
  //     location: spot.spotDetails.location,
  //     address: spot.spotDetails.address,
  //     description: spot.spotDetails.description,
  //     accessibility: spot.spotDetails.accessibility,
  //     bestTimes: spot.spotDetails.bestTimes,
  //     images: spot.spotDetails.images,
  //     tags: spot.spotDetails.tags,
  //     posterId: spot.spotDetails.posterId,
  //     createdAt: spot.spotDetails.createdAt,
  //     reportCount: spot.spotDetails.reportCount,
  //     averageRating: spot.averageRating,
  //     totalRatings: spot.totalRatings,
  //     contestInfo: currentMonth,
  //   };
  // });

  const newTopSpots = [];

  for (const spot of topSpots) {
    newTopSpots.push({
      _id: spot.spotDetails._id,
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
      averageRating: Number(spot.averageRating.toFixed(2)),
      totalRatings: spot.totalRatings,
    });
  }
  return newTopSpots;
};

export default {
  createSpot,
  updateSpot,
  deleteSpot,
  getAllSpots,
  getSpotById,
  addComment,
  getCommentById,
  getCommentsBySpotId,
  updateComment,
  deleteComment,
  putSpotRating,
  getRatingById,
  getRatingsBySpotId,
  deleteRating,
  getSpotRatingByUserId,
  getDisplayCommentsBySpotId,
  getReportedSpots,
  deleteReportedSpot,
  clearSpotReports,
  getReportedComments,
  deleteReportedComment,
  clearCommentReports,
  getSpotsByDistance,
  getLastMonthTopSpots,
};
