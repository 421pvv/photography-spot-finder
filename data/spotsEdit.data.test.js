import { userData, spotsData } from "./index.js";
import { closeConnection } from "../config/mongoConnection.js";
import { initDB, seedDB } from "../seed/seed.js";
import { passwordPolicies } from "../validation.js";
import { ObjectId } from "mongodb";
import { json } from "express";

describe("Testing users data functions", () => {
  let receivedUserInfo;
  let validSpotInfo;

  let validUserInfo = {
    firstName: "Siva Anand",
    lastName: "Sivakumar",
    username: "SivaAnand1",
    password: "FakePassword#2313",
  };
  afterAll(async () => {
    await closeConnection();
    await initDB();
    await seedDB();
  });
  beforeAll(async () => {
    await initDB();

    await userData.createUser(
      validUserInfo.firstName,
      validUserInfo.lastName,
      validUserInfo.username,
      validUserInfo.password
    );
    receivedUserInfo = await userData.getUserByUsername(validUserInfo.username);

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
  });
  describe("Testing userData.updateSpot functionality", () => {});
});
