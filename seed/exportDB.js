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

async function exportDB(fileName) {
  const db = await dbConnection();
  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    const command = `mongoexport --uri="${mongoConfig.serverUrl}" --db=${
      mongoConfig.database
    } --collection=${collection.name} --out="${`${import.meta.dirname}/${
      collection.name
    }.json`}" --jsonArray`;
    execSync(command);
  }
  await closeConnection();
}

await exportDB();
