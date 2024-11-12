import * as mongoCollections from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { readFile } from "fs/promises";
export async function initDB() {
  const usersCollection = await mongoCollections.users();
  await usersCollection.deleteMany({});
  const spotsCollection = await mongoCollections.spots();
  await spotsCollection.deleteMany({});
}

function converToObjectId(element) {
  element._id = ObjectId.createFromHexString(element._id.$oid);
  return element;
}

export async function seedDB() {
  /* adding new users */
  let usersData = JSON.parse(await readFile("./users.json", "utf8"));
  usersData = usersData.map(converToObjectId);
  await usersCollection.insertMany(usersData);

  // got some spots from: https://nycphotojourneys.com/best-places-to-take-pictures-in-nyc/
  let spotsData = JSON.parse(await readFile("./spots.json", "utf8"));
  spotsData = spotsData.map(converToObjectId);
  await spotsCollection.insertMany(spotsData);
}
