import { spots, comments, spotRatings } from "../config/mongoCollections.js";
import validation from "../validation.js";
import { userData } from "./index.js";
import { ObjectId } from "mongodb";
import logger from "../log.js";
import cloudinary from "../cloudinary/cloudinary.js";
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
  const curSpot = await getSpotById(spot_id);

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

    if (images) {
      curSpot.images.forEach((image) => {
        cloudinary.uploader
          .destroy(image.public_id)
          .catch((error) => logger.log(error));
      });
    }
  } catch (e) {
    throw [`Spot update failed!`];
  }
};

const deleteSpot = async (spotId, userId) => {
  const updateObject = {};

  spotId = validation.validateString(spotId, "Spot Id", true);
  const curSpot = await getSpotById(spot_id);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);

  if (userId.toString() !== curSpot.posterId.toString()) {
    throw [`Invalid spot delete attempt. User is not the original poster!`];
  }

  try {
    const spotsCollection = await spots();

    curSpot.images.forEach((image) => {
      cloudinary.uploader
        .destroy(image.public_id)
        .catch((error) => logger.log(error));
    });
    await spotsCollection.deleteOne({
      _id: ObjectId.createFromHexString(spotId),
    });

    const commentsCollection = await comments();
    const comments = await commentsCollection
      .find({
        spotId: ObjectId.createFromHexString(spotId),
      })
      .toArray();
    comments.forEach((comment) => {
      if (comment.image) {
        cloudinary.uploader
          .destroy(comment.image.public_id)
          .catch((error) => logger.log(error));
      }
    });
    await commentsCollection.deleteMany({
      spotId: ObjectId.createFromHexString(spotId),
    });

    const spotRatingsCollection = await spotRatings();
    await spotRatingsCollection.deleteMany({
      spotId: ObjectId.createFromHexString(spotId),
    });
  } catch (e) {
    logger.log(e);
    throw [`Spot delete failed!`];
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

  commentObject.reportCount = 0;

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

    if (image) {
      cloudinary.uploader
        .destroy(image.public_id)
        .catch((error) => logger.log(error));
    }
  } catch (e) {
    throw [`Comment update failed!`];
  }
};

const deleteComment = async (commentId, userId) => {
  const commentObject = {};
  commentId = validation.validateString(commentId, "Comment Id", true);
  const comment = await getCommentById(commentId);

  userId = validation.validateString(userId, "User Id", true);
  const userInfo = await userData.getUserProfileById(userId);

  if (userId.toString() !== userInfo._id.toString()) {
    throw [
      `Attempting to delete a comment but user is the original commenter!`,
    ];
  }

  try {
    if (comment.image) {
      cloudinary.uploader
        .destroy(comment.image.public_id)
        .catch((error) => logger.log(error));
    }
    const commentsCollection = await comments();
    await commentsCollection.deleteOne({
      _id: ObjectId.createFromHexString(commentId),
      posterId: ObjectId.createFromHexString(userId),
    });
  } catch (e) {
    logger.log(e);
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

const deleteSpotRatings = async (spotId, userId, rating, date) => {
  spotId = validation.validateString(spotId, "Spot Id", true);
  await getSpotById(spot_id);

  userId = validation.validateString(userId, "User Id", true);
  await userData.getUserProfileById(userId);

  try {
    const spotRatingsCollection = await spotRatings();
    await spotRatingsCollection.deleteOne({
      posterId: ObjectId.createFromHexString(userId),
      spotId: ObjectId.createFromHexString(spotId),
    });
  } catch (e) {
    throw [`Rating deletation failed!`];
  }
};

const reportSpot = async (userId, spotId) => {
  spotId = validation.validateString(spotId, "Spot Id", true);
  await getSpotById(spot_id);

  userId = validation.validateString(userId, "User Id", true);
  await userData.getUserProfileById(userId);

  try {
    const spotsCollection = await spots();
    spotsCollection.updateOne(
      {
        _id: ObjectId.createFromHexString(spotId),
      },
      {
        $inc: {
          reportCount: 1,
        },
      }
    );
  } catch (e) {
    throw [`Spot report failed!`];
  }
};

const reportComment = async (userId, commentId) => {
  commentId = validation.validateString(commentId, "Comment Id", true);
  await getCommentById(spot_id);

  userId = validation.validateString(userId, "User Id", true);
  await userData.getUserProfileById(userId);

  try {
    const commentsCollection = await spots();
    commentsCollection.updateOne(
      {
        _id: ObjectId.createFromHexString(commentId),
      },
      {
        $inc: {
          reportCount: 1,
        },
      }
    );
  } catch (e) {
    throw [`Comment report failed!`];
  }
};

export default {
  createSpot,
  getAllSpots,
};
