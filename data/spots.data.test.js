import { spotsData } from ".";
import { closeConnection } from "../config/mongoConnection.js";
import { initDB } from "../seed.js";

describe("Testing spots data functions", () => {
    afterAll(async () => {
      await closeConnection();
    });
    describe("Testing spotsData.createSpot", () => {
        let validSpotInfo = (validSpotInfo = {
            name: 'Brooklyn Bridge Park',
            location: 'NYC', 
            description: "a public park next to Brooklyn Bridge",
            accessibility: 'open between the hours of 6AM and 1AM next morning',
            bestTimes: ['Weekdays', 'mornings', 'afternoons', 'evenings'],
            images: [],
            tags: [],
            totalRatings: 50,
            avgRating: 5.5,
            currMonthTotalRating: 5,
            currMonthAvgRating: 7.5,
            posterId: new ObjectId(),
            comments: [],
            createdAt: new Date(),
            reportCount: 3,
        });
        const validSpotCopy = () => {
          return JSON.parse(JSON.stringify(validSpotInfo));
        };
    });
    describe("Testing input validation", () => {
      it("Throws when name, location, description, accessibility, bestTimes, images, totalRatings, avgRating, currMonthTotalRating, currMonthAvgRating, posterId, comments, createdAt, reportCount are not provided", async () => {
        let expectedSpotInfo;
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.name = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected name to be of type string, but it is not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.name = [a,b];
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected name to be of type string, but it is of type array",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.name = {hi: 432};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected name to be of type string, but it is of type object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.name = 1234;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected name to be of type string, but it is of type number",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.name = true;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected name to be of type string, but it is of type boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.location = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected location to be of type string, but it is not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.location = [a,b];
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected location to be of type string, but it is of type array",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.location = {hi: 432};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected location to be of type string, but it is of type object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.location = 1234;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected location to be of type string, but it is of type number",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.location = true;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected location to be of type string, but it is of type boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.description = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected description to be of type string, but it is not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.description = [a,b];
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected description to be of type string, but it is of type array",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.description = {hi: 432};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected description to be of type string, but it is of type object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.description = 1234;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected description to be of type string, but it is of type number",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.description = true;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected description to be of type string, but it is of type boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.accessibility = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected description to be of type string, but it is not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.accessibility = [a,b];
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected description to be of type string, but it is of type array",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.accessibility = {hi: 432};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected accessibility to be of type string, but it is of type object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.accessibility = 1234;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected accessibility to be of type string, but it is of type number",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.accessibility = true;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected accessibility to be of type string, but it is of type boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.bestTimes = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected bestTimes to be of type array, but it is not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.bestTimes = "hi";
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected bestTimes to be of type array, but it a string",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.bestTimes = {hi:1267};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected bestTimes to be of type array, but it an object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.bestTimes = false;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected bestTimes to be of type array, but it a boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.images = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected images to be of type array, but it is not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.images = "hi";
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected images to be of type array, but it a string",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.images  = 1234;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected images  to be of type array, but it a string",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.images = {hi:1267};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected images to be of type array, but it an object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.images = false;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected images to be of type array, but it a boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.tags  = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected tags  to be of type array, but it is not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.tags  = "hi";
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected tags  to be of type array, but it a string",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.tags  = 1234;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected tags  to be of type array, but it a number",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.tags  = {hi:1267};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected tags  to be of type array, but it an object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.tags  = false;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected tags  to be of type array, but it a boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.totalRatings  = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected totalRatings  to be of type number, but it not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.totalRatings  = "hi";
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected totalRatings  to be of type number, but it a string",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.totalRatings  = [1,2];
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected totalRatings  to be of type number, but it an array",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.totalRatings  = {hi:123};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected totalRatings  to be of type number, but it an object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.totalRatings  = false;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected totalRatings  to be of type number, but it a boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.avgRating  = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected avgRating  to be of type number, but it not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.avgRating  = "hi";
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected avgRating  to be of type number, but it a string",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.avgRating  = [1,2];
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected avgRating  to be of type number, but it an array",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.avgRating  = {hi:123};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected avgRating  to be of type number, but it an object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.avgRating  = false;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected avgRating  to be of type number, but it a boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthTotalRating  = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthTotalRating  to be of type number, but it not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthTotalRating  = "hi";
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthTotalRating  to be of type number, but it a string",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthTotalRating  = [1,2];
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthTotalRating  to be of type number, but it an array",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthTotalRating  = {hi:123};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthTotalRating  to be of type number, but it an object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthTotalRating  = false;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthTotalRating  to be of type number, but it a boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = "hi";
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it a string",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = [1,2];
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it an array",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = {hi:123};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it an object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = false;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it a boolean",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = undefined;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it not provided",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = "hi";
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it a string",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = [1,2];
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it an array",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = {hi:123};
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it an object",
        ]);
        expectedSpotInfo = validSpotCopy();
        expectedSpotInfo.currMonthAvgRating  = false;
        await expect(
          spotsData.createSpot(
            spot.name,
            spot.location,
            spot.description,
            spot.accessibility,
            spot.bestTimes,
            spot.images,
            spot.tags,
            spot.totalRatings,
            spot.avgRating,
            spot.currMonthTotalRating,
            spot.currMonthAvgRating,
            spot.posterId,
            spot.comments,
            spot.createdAt,
            spot.reportCount
          )
        ).rejects.toEqual([
          "Expected currMonthAvgRating  to be of type number, but it a boolean",
        ]);
        


        



      })
    })
});