import * as mongoCollections from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { usersData } from "./users.data.js";
import { spotsData } from "./spots.data.js";

export async function initDB() {
  const usersCollection = await mongoCollections.users();
  await usersCollection.deleteMany({});
  const spotsCollection = await mongoCollections.spots();
  await spotsCollection.deleteMany({});
  const spotRatings = await mongoCollections.spotRatings();
  await spotRatings.deleteMany({});
  const comments = await mongoCollections.comments();
  await comments.deleteMany({});
  const contestSpots = await mongoCollections.contestSpots();
  await contestSpots.deleteMany({});
  const contestSubmissions = await mongoCollections.contestSubmissions();
  await contestSubmissions.deleteMany({});
  const contestRatings = await mongoCollections.contestRatings();
  await contestRatings.deleteMany({});
}

function convertUserObject(element) {
  element._id = ObjectId.createFromHexString(element._id.$oid);
  return element;
}

function convertSpotObject(spot) {
  spot._id = ObjectId.createFromHexString(spot._id.$oid);
  spot.posterId = ObjectId.createFromHexString(spot.posterId.$oid);
  spot.createdAt = new Date(spot.createdAt.$date);

  return spot;
}

export async function seedDB() {
  const usersCollection = await mongoCollections.users();
  /* adding new users */
  let users = usersData.map(convertUserObject);
  await usersCollection.insertMany(users);

  const spotsCollection = await mongoCollections.spots();
  // got some spots from: https://nycphotojourneys.com/best-places-to-take-pictures-in-nyc/
  let spots = spotsData.map(convertSpotObject);
  await spotsCollection.insertMany(spots);
}
