import { spots, comments, spotRatings } from "../config/mongoCollections.js";
import validation from "../validation.js";
import { ObjectId } from "mongodb";
import { userData } from "./index.js";
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

// Function to get all spots which have number of reports less than 20, to be displayed on the spots list page
const getAllSpots = async () => {
  const spotsCollection = await spots();
  const allSpotsList = await spotsCollection
    .find({ reportCount: { $lt: 20 } })
    .toArray();
  if (!allSpotsList) {
    throw ["Could not get all spots"];
  }
  return allSpotsList;
};

// Function to get spots by rating range (inclusive). Takes two ratings as input minRating and maxRating
// returns a list of all spots in the inclusive range
const getSpotsByRating = async (minRating, maxRating) => {
  validation.validateRating(minRating);
  validation.validateRating(maxRating);
  if (minRating > maxRating) {
    throw ["minRating cannot be greater than maxRating"];
  }
  const spotsCollection = await spots();
  const spotsRatingList = await spotsCollection
    .find({
      $and: [
        { avgRating: { $gte: minRating } },
        { avgRating: { $lte: maxRating } },
        { reportCount: { $lt: 20 } },
      ],
    })
    .toArray();
  if (!spotsRatingList) {
    throw ["Could not get spots in the specified rating range"];
  }
  return spotsRatingList;
};

// Returns a list of spots with the given keyword (Searchs for keyword in name, accessibility and bestTimes)
const getSpotsByKeywordSearch = async (keyword) => {
  keyword = validation.validateString(keyword, "keyword", false);
  const searchRegex = new RegExp("^.*" + keyword + ".*$", "i");
  const spotsCollection = await spots();
  const spotsKeywordsList = await spotsCollection
    .find({
      $and: [
        {
          $or: [
            { name: searchRegex },
            { accessibility: searchRegex },
            { bestTimes: { $elemMatch: { $regex: searchRegex } } },
          ],
        },
        { reportCount: { $lt: 20 } },
      ],
    })
    .toArray();
  if (!spotsKeywordsList) {
    throw ["Could not get spots with the specified keyword"];
  }
  return spotsKeywordsList;
};

// Returns a list of all spots that have the given tag/tags in the tags array
const getSpotsByTags = async (tagsArr) => {
  if (tagsArr === undefined) {
    throw ["tagsArr is missing"];
  }
  if (!Array.isArray(tagsArr)) {
    throw ["tagsArr is not an array"];
  }
  const len = tagsArr.length;
  if (len === 0) {
    throw ["tagsArr is empty"];
  }
  for (let i = 0; i < len; i++) {
    let tag = tagsArr[i];
    tag = validation.validateString(tag, "tag", false);
    tag = tag.toLowerCase();
    tagsArr[i] = tag;
  }
  const spotsCollection = await spots();
  const spotsListByTags = await spotsCollection
    .find({
      $and: [{ tags: { $all: tagsArr } }, { reportCount: { $lt: 20 } }],
    })
    .toArray();
  if (!spotsListByTags) {
    throw ["Could not get spots with the given tags"];
  }
  return spotsListByTags;
};

// Returns an array spots posted in the last 24 hours
const getSpotsLastDay = async () => {
  const spotsCollection = await spots();
  // Reference: https://stackoverflow.com/questions/13314678/mongodb-only-fetch-documents-created-in-the-last-24hrs
  const spotsLastDay = await spotsCollection
    .find({
      $and: [
        { createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        { reportCount: { $lt: 20 } },
      ],
    })
    .toArray();
  if (!spotsLastDay) {
    throw ["Could not get the spots in the last 24 hours"];
  }
  return spotsLastDay;
};

// Returns an array spots posted in the last 30 days
const getSpotsLastMonth = async () => {
  const spotsCollection = await spots();
  // Reference: https://stackoverflow.com/questions/13314678/mongodb-only-fetch-documents-created-in-the-last-24hrs
  const spotsLastMonth = await spotsCollection
    .find({
      $and: [
        { createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 30) } },
        { reportCount: { $lt: 20 } },
      ],
    })
    .toArray();
  if (!spotsLastMonth) {
    throw ["Could not get the spots in the last month"];
  }
  return spotsLastMonth;
};

// Returns an array spots posted in the last 365 days
const getSpotsLastYear = async () => {
  const spotsCollection = await spots();
  // Reference: https://stackoverflow.com/questions/13314678/mongodb-only-fetch-documents-created-in-the-last-24hrs
  const spotsLastYear = await spotsCollection
    .find({
      $and: [
        {
          createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 365) },
        },
        { reportCount: { $lt: 20 } },
      ],
    })
    .toArray();
  if (!spotsLastYear) {
    throw ["Could not get the spots in the last year"];
  }
  return spotsLastYear;
};

const getSpotsByDateRange = async (startDate, endDate) => {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw ["Both startDate and endDate must be valid Date objects."];
  }

  if (startDate >= endDate) {
    throw ["The startDate must be earlier than the endDate."];
  }

  const spotsCollection = await spots();

  const spotsInDateRange = await spotsCollection
    .find({
      $and: [
        {
          createdAt: {
            $gte: startDate,
          },
        },
        { createdAt: { $lte: endDate } },
        { reportCount: { $lt: 20 } },
      ],
    })
    .toArray();

  if (spotsInDateRange.length === 0) {
    throw ["No spots found within the specified date range."];
  }

  return spotsInDateRange;
};

// takes id as a string parameter and returns the spot with that id
const getSpotById = async (id) => {
  id = validation.validateString(id, "id", true);
  const spotsCollection = await spots();
  const spot = await spotsCollection.findOne(
    {
      _id: ObjectId.createFromHexString(id),
    },
    {}
  );
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
  }
  try {
    const spotsCollection = await spots();
    spotsCollection.updateOne(
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
};

const getCommentById = async (id) => {
  id = validation.validateString(id, "Comment Id", true);
  const commentsCollection = comments();
  return await commentsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const addComment = async (spotId, userId, message, image) => {
  const commentObject = {};
  spotId = validation.validateString(spotId, "Spot Id", true);
  const spot = await getSpotById(spot_id);
  commentObject.spotId = ObjectId.createFromHexString(spotId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);
  commentObject.posterId = ObjectId.createFromHexString(posterId);

  message = validation.validateString(message);
  commentObject.message = message;

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

  try {
    const commentsCollectin = await comments();
    await commentsCollectin.insertOne(commentObject);
  } catch (e) {
    throw [`Comment submision failed!`];
  }
};

const updateComment = async (commentId, userId, message, image) => {
  const commentObject = {};
  commentId = validation.validateString(commentId, "Comment Id", true);
  const spot = await getCommentById(commentId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);

  if (userId.toString() !== userInfo._id.toString()) {
    throw [
      `Attempting to update a comment but user is the original commenter!`,
    ];
  }

  message = validation.validateString(message);
  commentObject.message = message;

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
};

const deleteComment = async (commentId, userId) => {
  const commentObject = {};
  commentId = validation.validateString(commentId, "Comment Id", true);
  const spot = await getCommentById(commentId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);

  if (userId.toString() !== userInfo._id.toString()) {
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
};
const putspotRatings = async (spotId, userId, rating, date) => {
  const ratingObject = {};
  spotId = validation.validateString(spotId, "Spot Id", true);
  const spot = await getSpotById(spot_id);
  ratingObject.spotId = ObjectId.createFromHexString(spotId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);
  ratingObject.posterId = ObjectId.createFromHexString(posterId);

  validation.validateNumber(rating);
  if (rating < 1 || rating > 10) {
    throw [`Rating must be between 1 and 10 (inclusive)!`];
  }

  validation.validateObject(date);
  if (!(date instanceof Date) || isNaN(date) || date > new Date()) {
    throw ["Invalid date for rating."];
  }
  ratingObject.createdAt = date;

  ratingObject.reportCount = 0;
  try {
    const spotRatingsCollection = await spotRatings();
    await spotRatingsCollection.updateOne(
      {
        $and: [
          { spotId: ratingObject.spotId },
          { posterId: ratingObject.posterId },
        ],
      },
      { $set: ratingObject },
      { upsert: true }
    );

    // update spots ratings
    const updatedRatings = (
      await spotRatings
        .aggregate([
          {
            $match: {
              spotId: ratingObject.spotId,
            },
          },
          {
            $group: {
              averageRating: { $sum: 1 },
              totalRatings: { $avg: "$rating" },
            },
          },
        ])
        .toArray()
    )[0];

    const spotsCollection = await spots();
    await spotsCollection.updateOne(
      {
        _id: ratingObject.spotId,
      },
      {
        $set: {
          averageRating: updatedRatings.averageRating,
          totalRatings: updatedRatings.totalRatings,
        },
      }
    );
  } catch (e) {
    throw [`Comment submision failed!`];
  }
};

export default {
  createSpot,
  updateSpot,
  getAllSpots,
  getSpotsByRating,
  getSpotsByKeywordSearch,
  getSpotsByTags,
  getSpotsLastDay,
  getSpotsLastMonth,
  getSpotsLastYear,
  getSpotById,
};
