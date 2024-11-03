import * as mongoCollections from "./config/mongoCollections.js";

export async function initDB() {
  const usersCollection = await mongoCollections.users();
  await usersCollection.drop();
}
