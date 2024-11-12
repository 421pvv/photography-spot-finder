import * as mongoCollections from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { usersData } from "./users.data.js";
import { spotsData } from "./spots.data.js";

export async function initDB() {
  const usersCollection = await mongoCollections.users();
  await usersCollection.deleteMany({});
  const spotsCollection = await mongoCollections.spots();
  await spotsCollection.deleteMany({});
}

function convertToObjectId(element) {
  element._id = ObjectId.createFromHexString(element._id.$oid);
  return element;
}

function convertPosterIdToObjectId(spot) {
  spot.posterId = ObjectId.createFromHexString(spot.posterId.$oid);
  return spot;
}

export async function seedDB() {
  const usersCollection = await mongoCollections.users();
  /* adding new users */
  let users = usersData.map(convertToObjectId);
  await usersCollection.insertMany(users);

  const spotsCollection = await mongoCollections.spots();
  // got some spots from: https://nycphotojourneys.com/best-places-to-take-pictures-in-nyc/
  let spots = spotsData.map(convertToObjectId).map(convertPosterIdToObjectId);
  await spotsCollection.insertMany(spots);
}
