import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const users = getCollectionFn("users");
export const spots = getCollectionFn("spots");
export const comments = getCollectionFn("comments");
export const spotRatings = getCollectionFn("spotRatings");
export const contestSubmissions = getCollectionFn("contestSubmissions");
export const contestRatings = getCollectionFn("contestRatings");
