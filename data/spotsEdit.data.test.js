import { userData, spotsData } from "./index.js";
import { closeConnection } from "../config/mongoConnection.js";
import { initDB, seedDB } from "../seed/seed.js";
import { passwordPolicies } from "../validation.js";
import { ObjectId } from "mongodb";
import { json } from "express";

describe("Testing users data functions", () => {
  let receivedUserInfo;
  let validSpotInfo;
  let invalidUserInfo;
  let validSpotEdit;
  let originalSpot;
  let validUserInfo = {
    firstName: "Siva Anand",
    lastName: "Sivakumar",
    username: "SivaAnand1",
    password: "FakePassword#2313",
  };
  afterAll(async () => {
    await initDB();
    await seedDB();
    await closeConnection();
  });

  const validSpotUpdateCopy = () => JSON.parse(JSON.stringify(validSpotEdit));
  describe("Testing userData.updateSpot functionality", () => {
    beforeEach(async () => {
      await initDB();

      await userData.createUser(
        validUserInfo.firstName,
        validUserInfo.lastName,
        validUserInfo.username,
        validUserInfo.password
      );
      await userData.createUser(
        "Dhruvish",
        "Parekh",
        "dhruvish",
        "Password@1234"
      );
      receivedUserInfo = await userData.getUserByUsername(
        validUserInfo.username
      );
      invalidUserInfo = await userData.getUserByUsername("dhruvish");
      console.log(invalidUserInfo);
      validSpotInfo = {
        name: "Grand Central Terminal",
        location: {
          type: "Point",
          coordinates: [-73.977362, 40.752467],
        },
        address:
          "Grand Central Terminal, 87 E 42nd St, New York City, New York 10017, United States",
        description:
          "Besides being a major transportation hub, the Grand Central Terminal is an iconic photography spot with great architecture and history. In addition to all the opportunity for photography it provides, there are also a lot of places to shop and to eat!",
        accessibility:
          "Due to being a transportation hub, the Grand Central Terminal is highly accessible. It has ramps, elevators, escalators, wheelchair access, and audiovisual passenger information systems. Moreover, the station is open and free to access.",
        bestTimes: ["non-rush hours", "weekends"],
        images: [
          {
            public_id: "fhaoqxqecfmwofjtfgqk",
            url: "https://res.cloudinary.com/db7w46lyt/image/upload/v1731419325/fhaoqxqecfmwofjtfgqk.jpg",
          },
          {
            public_id: "d0lwskdj0yzpzwdkza7d",
            url: "https://res.cloudinary.com/db7w46lyt/image/upload/v1731419448/d0lwskdj0yzpzwdkza7d.jpg",
          },
        ],
        tags: ["architecture", "transportation", "station", "nyc"],
        posterId: receivedUserInfo._id.toString(),
        createdAt: new Date("2024-11-12T13:50:57.450Z"),
        reportCount: 0,
        averageRating: 0,
        totalRatings: 0,
      };
      originalSpot = await spotsData.createSpot(
        validSpotInfo.name,
        validSpotInfo.location,
        validSpotInfo.address,
        validSpotInfo.description,
        validSpotInfo.accessibility,
        validSpotInfo.bestTimes,
        validSpotInfo.images,
        validSpotInfo.tags,
        validSpotInfo.posterId,
        validSpotInfo.createdAt
      );

      validSpotEdit = {
        name: "Grand Central Terminal",
        location: {
          type: "Point",
          coordinates: [-73.977362, 40.752467],
        },
        address: "Edited Address",
        description: "Edited Description",
        accessibility: "Edited accessibility.",
        bestTimes: ["non-rush hours", "summer", "weekends"],
        images: [
          {
            public_id: "testImage1",
            url: "https://res.cloudinary.com/db7w46lyt/image/upload/v1731419325/fhaoqxqecfmwofjtfgqk.jpg",
          },
          {
            public_id: "testImage2",
            url: "https://res.cloudinary.com/db7w46lyt/image/upload/v1731419448/d0lwskdj0yzpzwdkza7d.jpg",
          },
        ],
        tags: ["architecture", "edittransportation", "station", "editnyc"],
        posterId: receivedUserInfo._id.toString(),
        createdAt: new Date("2024-11-12T13:50:57.450Z"),
      };
    });
    it("Throws when a differnt user tries to modify the spot", async () => {
      console.log(validSpotEdit);
      await expect(
        spotsData.updateSpot(
          originalSpot._id.toString(),
          invalidUserInfo._id.toString(),
          validSpotUpdateCopy()
        )
      ).rejects.toEqual([
        "Invalid spot update attempt. User is not the original poster!",
      ]);
    });
    it("Updates the spot when user and all update fields are provided and are valid", async () => {
      console.log(validSpotEdit);
      const receivedUpdatedSpot = await spotsData.updateSpot(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        validSpotUpdateCopy()
      );
      const expectedSpot = JSON.parse(JSON.stringify(validSpotEdit));
      expectedSpot._id = originalSpot._id;
      expectedSpot.reportCount = originalSpot.reportCount;
      expectedSpot.averageRating = originalSpot.averageRating;
      expectedSpot.totalRatings = originalSpot.totalRatings;
      receivedUpdatedSpot.createdAt =
        receivedUpdatedSpot.createdAt.toISOString();
      receivedUpdatedSpot.posterId = receivedUpdatedSpot.posterId.toString();
      expect(receivedUpdatedSpot).toEqual(expectedSpot);
    });
    it("Updates the spot name when user id is valid and original poster", async () => {
      const expectedSpot = JSON.parse(JSON.stringify(validSpotInfo));
      expectedSpot.name = "Edited Name";
      const receivedUpdatedSpot = await spotsData.updateSpot(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        expectedSpot
      );
      expectedSpot._id = originalSpot._id;
      expectedSpot.reportCount = originalSpot.reportCount;
      expectedSpot.averageRating = originalSpot.averageRating;
      expectedSpot.totalRatings = originalSpot.totalRatings;
      receivedUpdatedSpot.createdAt =
        receivedUpdatedSpot.createdAt.toISOString();
      receivedUpdatedSpot.posterId = receivedUpdatedSpot.posterId.toString();
      expect(receivedUpdatedSpot).toEqual(expectedSpot);
    });
    it("Updates the spot description when user id is valid and original poster", async () => {
      const expectedSpot = JSON.parse(JSON.stringify(validSpotInfo));
      expectedSpot.description = "Edited Description";
      const receivedUpdatedSpot = await spotsData.updateSpot(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        expectedSpot
      );
      expectedSpot._id = originalSpot._id;
      expectedSpot.reportCount = originalSpot.reportCount;
      expectedSpot.averageRating = originalSpot.averageRating;
      expectedSpot.totalRatings = originalSpot.totalRatings;
      receivedUpdatedSpot.createdAt =
        receivedUpdatedSpot.createdAt.toISOString();
      receivedUpdatedSpot.posterId = receivedUpdatedSpot.posterId.toString();
      expect(receivedUpdatedSpot).toEqual(expectedSpot);
    });
    it("Updates the spot accessibility when user id is valid and original poster", async () => {
      const expectedSpot = JSON.parse(JSON.stringify(validSpotInfo));
      expectedSpot.accessibility = "Edited accessibility";
      const receivedUpdatedSpot = await spotsData.updateSpot(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        expectedSpot
      );
      expectedSpot._id = originalSpot._id;
      expectedSpot.reportCount = originalSpot.reportCount;
      expectedSpot.averageRating = originalSpot.averageRating;
      expectedSpot.totalRatings = originalSpot.totalRatings;
      receivedUpdatedSpot.createdAt =
        receivedUpdatedSpot.createdAt.toISOString();
      receivedUpdatedSpot.posterId = receivedUpdatedSpot.posterId.toString();
      expect(receivedUpdatedSpot).toEqual(expectedSpot);
    });
    it("Updates the spot accessibility when user id is valid and original poster", async () => {
      const expectedSpot = JSON.parse(JSON.stringify(validSpotInfo));
      expectedSpot.bestTimes = [
        "Edited accessibility",
        "       Valid best time",
        "best time edit",
      ];
      const receivedUpdatedSpot = await spotsData.updateSpot(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        expectedSpot
      );
      expectedSpot._id = originalSpot._id;
      expectedSpot.reportCount = originalSpot.reportCount;
      expectedSpot.averageRating = originalSpot.averageRating;
      expectedSpot.totalRatings = originalSpot.totalRatings;
      receivedUpdatedSpot.createdAt =
        receivedUpdatedSpot.createdAt.toISOString();
      receivedUpdatedSpot.posterId = receivedUpdatedSpot.posterId.toString();
      expect(receivedUpdatedSpot).toEqual(expectedSpot);
    });
    it("Updates the spot accessibility when user id is valid and original poster", async () => {
      const expectedSpot = JSON.parse(JSON.stringify(validSpotInfo));
      expectedSpot.tags = [
        "Edited tags",
        "       Valid best time",
        "best tags edit",
      ];
      const receivedUpdatedSpot = await spotsData.updateSpot(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        expectedSpot
      );
      expectedSpot._id = originalSpot._id;
      expectedSpot.reportCount = originalSpot.reportCount;
      expectedSpot.averageRating = originalSpot.averageRating;
      expectedSpot.totalRatings = originalSpot.totalRatings;
      receivedUpdatedSpot.createdAt =
        receivedUpdatedSpot.createdAt.toISOString();
      receivedUpdatedSpot.posterId = receivedUpdatedSpot.posterId.toString();
      expect(receivedUpdatedSpot).toEqual(expectedSpot);
    });
    it("Updates the spot accessibility when user id is valid and original poster", async () => {
      const expectedSpot = JSON.parse(JSON.stringify(validSpotInfo));
      expectedSpot.location = {
        type: "Point",
        coordinates: [-74, 40.89],
      };
      const receivedUpdatedSpot = await spotsData.updateSpot(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        expectedSpot
      );
      expectedSpot._id = originalSpot._id;
      expectedSpot.reportCount = originalSpot.reportCount;
      expectedSpot.averageRating = originalSpot.averageRating;
      expectedSpot.totalRatings = originalSpot.totalRatings;
      receivedUpdatedSpot.createdAt =
        receivedUpdatedSpot.createdAt.toISOString();
      receivedUpdatedSpot.posterId = receivedUpdatedSpot.posterId.toString();
      expect(receivedUpdatedSpot).toEqual(expectedSpot);
    });
    it("Updates the spot accessibility when user id is valid and original poster", async () => {
      const expectedSpot = JSON.parse(JSON.stringify(validSpotInfo));
      expectedSpot.address = "Fake Address 1234";
      const receivedUpdatedSpot = await spotsData.updateSpot(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        expectedSpot
      );
      expectedSpot._id = originalSpot._id;
      expectedSpot.reportCount = originalSpot.reportCount;
      expectedSpot.averageRating = originalSpot.averageRating;
      expectedSpot.totalRatings = originalSpot.totalRatings;
      receivedUpdatedSpot.createdAt =
        receivedUpdatedSpot.createdAt.toISOString();
      receivedUpdatedSpot.posterId = receivedUpdatedSpot.posterId.toString();
      expect(receivedUpdatedSpot).toEqual(expectedSpot);
    });
    it("Updates the spot accessibility when user id is valid and original poster", async () => {
      const expectedSpot = JSON.parse(JSON.stringify(validSpotInfo));
      expectedSpot.images = [
        {
          public_id: "12312",
          url: "https://res.cloudinary.com/db7w46lyt/image/upload/v1731708527/hjefzgk6ivfduaaqvq4t.jpg",
        },
      ];
      const receivedUpdatedSpot = await spotsData.updateSpot(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        expectedSpot
      );
      expectedSpot._id = originalSpot._id;
      expectedSpot.reportCount = originalSpot.reportCount;
      expectedSpot.averageRating = originalSpot.averageRating;
      expectedSpot.totalRatings = originalSpot.totalRatings;
      receivedUpdatedSpot.createdAt =
        receivedUpdatedSpot.createdAt.toISOString();
      receivedUpdatedSpot.posterId = receivedUpdatedSpot.posterId.toString();
      expect(receivedUpdatedSpot).toEqual(expectedSpot);
    });
  });
});
