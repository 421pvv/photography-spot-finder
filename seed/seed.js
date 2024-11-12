import * as mongoCollections from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { readFile } from "fs/promises";
export async function initDB() {
  const usersCollection = await mongoCollections.users();
  await usersCollection.deleteMany({});
  const spotsCollection = await mongoCollections.spots();
  await spotsCollection.deleteMany({});

  /* adding new users */
  let usersData = JSON.parse(
    await readFile(new URL("./users.json", import.meta.url), "utf8")
  );
  usersData = usersData.map(converToObjectId);
  await usersCollection.insertMany(usersData);

  // got some spots from: https://nycphotojourneys.com/best-places-to-take-pictures-in-nyc/
  let spotsData = JSON.parse(
    await readFile(new URL("./spots.json", import.meta.url), "utf8")
  );
  spotsData = spotsData.map(converToObjectId);
  await spotsCollection.insertMany(spotsData);
}

function converToObjectId(element) {
  element._id = ObjectId.createFromHexString(element._id.$oid);
  return element;
}
