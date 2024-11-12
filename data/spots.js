import { spots } from "../config/mongoCollections.js";
import validation from "../validation.js";
import { userData } from "./index.js";
import { ObjectId } from "mongodb";

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

  console.log(bestTimes);
  validation.validateArray(bestTimes, "Best Times");
  if (bestTimes.length == 0) throw [`Must provide at least one best time!`];
  for (const tagI in bestTimes) {
    bestTimes[tagI] = validation.validateString(bestTimes[tagI]).toLowerCase();
  }

  validation.validateArray(tags, "tags");
  if (tags.length > 0) {
    for (const tagI in tags) {
      try {
        tags[tagI] = validation.validateString(tags[tagI]).toLowerCase();
      } catch (e) {
        tagErrors.push(
          `Invalid tag: "${tags[tagI]}". A tag cannot be blank or just spaces.`
        );
      }
    }
  }
  if (Array.isArray(tags) && tags.length > 5) {
    throw `A maximum of five tags is allowed`;
  }

  validation.validateObject(location, "Location");
  validation.validateCoordinates(...location.coordinates);

  console.log(images);
  validation.validateArray(images, "images");
  for (const image of images) {
    if (!image.public_id || !image.url) {
      throw ["Missing image object attributes"];
    }
    validation.validateString(image.public_id);
    validation.validateString(image.url);
  }
  if (images.length === 0 || images.length > 3) {
    throw [`Invalid number of images!`];
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
  const spot = await spotsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (spot === null) {
    throw [`No spot with id of ${id}`];
  }
  return spot;
};

export default {
  createSpot,
  getAllSpots,
  getSpotsByRating,
  getSpotsByKeywordSearch,
  getSpotsByTags,
  getSpotsLastDay,
  getSpotsLastMonth,
  getSpotsLastYear,
  getSpotsByDateRange,
};
