import {
  spots,
  users,
  spotRatings,
  comments,
} from "../config/mongoCollections.js";
import fs from "fs/promises";
import exec, { execSync } from "child_process";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { mongoConfig } from "../config/settings.js";
import { initDB } from "./seed.js";

async function importDB(fileName) {
  await initDB();
  const db = await dbConnection();
  const collections = [
    "users",
    "spotRatings",
    "comments",
    "spots",
    "contestSpots",
    "contestSubmissions",
    "contestRatings",
  ];
  for (const collection of collections) {
    const command = `mongoimport --uri="${mongoConfig.serverUrl}" --db=${
      mongoConfig.database
    } --collection=${collection} --file="${`${
      import.meta.dirname
    }/${collection}.json`}" --jsonArray`;
    execSync(command);
  }
  await closeConnection();
}

export default importDB;
