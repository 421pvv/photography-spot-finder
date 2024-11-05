import * as mongoCollections from './config/mongoCollections.js';
import { ObjectId } from 'mongodb';

export async function initDB() {
  const usersCollection = await mongoCollections.users();
  await usersCollection.deleteMany({});
  const spotsCollection = await mongoCollections.spots();
  await spotsCollection.deleteMany({});
  const spot1 = {
    name: 'TimeSquare',
    location: 'NYC',
    description: 'a very crowded place in NYC',
    accessibility: 'always open to public',
    bestTimes: ['Weekdays', 'midnight'],
    images: [],
    tags: [],
    totalRatings: 25,
    avgRating: 5.5,
    currMonthTotalRating: 5,
    currMonthAvgRating: 7.5,
    posterId: new ObjectId(),
    comments: [],
    createdAt: new Date(),
    reportCount: 3,
  };

  const spot2 = {
    name: 'TimeSquare2',
    location: 'NYC2',
    description: 'a very crowded place in NYC2',
    accessibility: 'always open to public2',
    bestTimes: ['Weekdays', 'midnight', 'early morning'],
    images: [],
    tags: [],
    totalRatings: 43,
    avgRating: 5,
    currMonthTotalRating: 0,
    currMonthAvgRating: 0,
    posterId: new ObjectId(),
    comments: [],
    createdAt: new Date(),
    reportCount: 0,
  };

  const spot3 = {
    name: 'TimeSquare3',
    location: 'NYC3',
    description: 'an empty space',
    accessibility: 'need special permission from owner to enter',
    bestTimes: ['Weekdays'],
    images: [],
    tags: [],
    totalRatings: 0,
    avgRating: 0,
    currMonthTotalRating: 0,
    currMonthAvgRating: 0,
    posterId: new ObjectId(),
    comments: [],
    createdAt: new Date(),
    reportCount: 25,
  };
  const dummySpots = [spot1, spot2, spot3];
  await spotsCollection.insertMany(dummySpots);
}
