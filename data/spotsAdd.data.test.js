import { userData, spotsData } from "./index.js";
import { closeConnection } from "../config/mongoConnection.js";
import { initDB } from "../seed/seed.js";
import { passwordPolicies } from "../validation.js";
import { ObjectId } from "mongodb";
import { json } from "express";

describe("Testing users data functions", () => {
  afterAll(async () => {
    await closeConnection();
  });
  describe("Testing userData.createSpot input validation", () => {
    let receivedUserInfo;
    let validSpotInfo;

    let validUserInfo = {
      firstName: "Siva Anand",
      lastName: "Sivakumar",
      username: "SivaAnand1",
      password: "FakePassword#2313",
    };

    beforeAll(async () => {
      await initDB();
      await userData.createUser(
        validUserInfo.firstName,
        validUserInfo.lastName,
        validUserInfo.username,
        validUserInfo.password
      );
      receivedUserInfo = await userData.getUserByUsername(
        validUserInfo.username
      );

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
      };
    });
    const validSpotCopy = () => {
      const spot = JSON.parse(JSON.stringify(validSpotInfo));
      spot.createdAt = new Date(spot.createdAt);
      return spot;
    };
    it("Throws when paramets are not provided", async () => {
      let expectedSpot;

      expectedSpot = validSpotCopy();
      expectedSpot.name = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected Name to be of type string, but it is not provided!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.location = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected Location to be of type object, but it is undefined!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.address = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected Address to be of type string, but it is not provided!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.description = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected Description to be of type string, but it is not provided!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.accessibility = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected Accessibility to be of type string, but it is not provided!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.bestTimes = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected Best Times to be of type array, but it is not an array!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.images = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected images to be of type array, but it is not an array!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.tags = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected tags to be of type array, but it is not an array!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.posterId = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected Poster ID to be of type string, but it is not provided!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.createdAt = undefined;
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected createdAt to be a Date object, but it's not",
      ]);
    });
    it("Throws when paramets are not valid or of proper type", async () => {
      let expectedSpot;

      expectedSpot = validSpotCopy();
      expectedSpot.name = "";
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual(["String Name is empty or has only spaces!"]);

      expectedSpot = validSpotCopy();
      expectedSpot.name = ["String Name is empty or has only spaces!"];
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected Name to be of type string, but it is an array!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.address = "\t \n   ";
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual(["String Address is empty or has only spaces!"]);

      expectedSpot = validSpotCopy();
      expectedSpot.description = "";
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual(["String Description is empty or has only spaces!"]);

      expectedSpot = validSpotCopy();
      expectedSpot.accessibility = " \t \n";
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual(["String Accessibility is empty or has only spaces!"]);

      expectedSpot = validSpotCopy();
      expectedSpot.bestTimes = "string";
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected Best Times to be of type array, but it is not an array!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.bestTimes = ["string", 1235456];
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected  to be of type string, but it is of type number!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.bestTimes = ["", 1235456];
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual(["String  is empty or has only spaces!"]);

      expectedSpot = validSpotCopy();
      expectedSpot.images = [];
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual(["Invalid number of images!"]);

      expectedSpot = validSpotCopy();
      expectedSpot.images = [undefined];
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected image to be of type object, but it is undefined!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.images = [{}];
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual(["Missing image object attributes"]);

      expectedSpot = validSpotCopy();
      expectedSpot.tags = [undefined];
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected tag to be of type string, but it is not provided!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.tags = [8958];
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected tag to be of type string, but it is of type number!",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.posterId = "affd";
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual(["String (affd) is not a valid ObjectId!"]);

      expectedSpot = validSpotCopy();
      expectedSpot.posterId = "67335d41451909293ded1c66";
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Could not find user with id (67335d41451909293ded1c66)",
      ]);

      expectedSpot = validSpotCopy();
      expectedSpot.createdAt = "fdasf";
      await expect(
        spotsData.createSpot(
          expectedSpot.name,
          expectedSpot.location,
          expectedSpot.address,
          expectedSpot.description,
          expectedSpot.accessibility,
          expectedSpot.bestTimes,
          expectedSpot.images,
          expectedSpot.tags,
          expectedSpot.posterId,
          expectedSpot.createdAt
        )
      ).rejects.toEqual([
        "Expected createdAt to be a Date object, but it's not",
      ]);
    });
  });
  describe("Testing userData.createSpot functionality", () => {
    let receivedUserInfo;
    let validSpotInfo;

    let validUserInfo = {
      firstName: "Siva Anand",
      lastName: "Sivakumar",
      username: "SivaAnand1",
      password: "FakePassword#2313",
    };

    beforeAll(async () => {
      await initDB();
      await userData.createUser(
        validUserInfo.firstName,
        validUserInfo.lastName,
        validUserInfo.username,
        validUserInfo.password
      );
      receivedUserInfo = await userData.getUserByUsername(
        validUserInfo.username
      );

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
    });
    const validSpotCopy = () => {
      const spot = JSON.parse(JSON.stringify(validSpotInfo));
      spot.posterId = ObjectId.createFromHexString(spot.posterId);
      spot.createdAt = new Date(spot.createdAt);
      return spot;
    };
    it("creates new spot succesfully", async () => {
      const receivedSpot = await spotsData.createSpot(
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
      const expectedSpot = validSpotCopy();
      delete receivedSpot._id;
      expect(receivedSpot).toEqual(expectedSpot);
    });
  });
});
