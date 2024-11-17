import { userData, spotsData } from "./index.js";
import { closeConnection } from "../config/mongoConnection.js";
import { initDB, seedDB } from "../seed/seed.js";

describe("Testing ratings data functions", () => {
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
    receivedUserInfo = await userData.getUserByUsername(validUserInfo.username);
    invalidUserInfo = await userData.getUserByUsername("dhruvish");
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
  });

  const validSpotUpdateCopy = () => JSON.parse(JSON.stringify(validSpotEdit));
  describe("Testing spotsData.putSpotRating", () => {
    describe("Testing spotsData.putSpotRating input validation", () => {
      it("Throws when spot id empty", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            undefined,
            receivedUserInfo._id.toString(),
            1.2,
            new Date()
          )
        ).rejects.toEqual([
          "Expected Spot Id to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when spot id is not valid string", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            " \t \n ",
            receivedUserInfo._id.toString(),
            1.2,
            new Date()
          )
        ).rejects.toEqual(["String Spot Id is empty or has only spaces!"]);
      });
      it("Throws when spot id is not valid mongo objectId", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            "undefined",
            receivedUserInfo._id.toString(),
            1.2,
            new Date()
          )
        ).rejects.toEqual(["String (undefined) is not a valid ObjectId!"]);
      });
      it("Throws when spot id does not exit in spots collection", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            receivedUserInfo._id.toString(),
            receivedUserInfo._id.toString(),
            1.2,
            new Date()
          )
        ).rejects.toEqual([
          `No spot with id of ${receivedUserInfo._id.toString()}`,
        ]);
      });
      it("Throws when spot id empty", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            undefined,
            receivedUserInfo._id.toString(),
            1.2,
            new Date()
          )
        ).rejects.toEqual([
          "Expected Spot Id to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when user id is not valid string", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            originalSpot._id.toString(),
            "  \t \n",
            1.2,
            new Date()
          )
        ).rejects.toEqual(["String User Id is empty or has only spaces!"]);
      });
      it("Throws when user id is not valid mongo objectId", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            originalSpot._id.toString(),
            ":sdfsad",
            1.2,
            new Date()
          )
        ).rejects.toEqual(["String (:sdfsad) is not a valid ObjectId!"]);
      });
      it("Throws when spot id does not exit in spots collection", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            originalSpot._id.toString(),
            originalSpot._id.toString(),
            1.2,
            new Date()
          )
        ).rejects.toEqual([
          `Could not find user with id (${originalSpot._id.toString()})`,
        ]);
      });
      it("Throws when spot id does not exit in spots collection", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            originalSpot._id.toString(),
            receivedUserInfo._id.toString(),
            "1.2",
            new Date()
          )
        ).rejects.toEqual(["Rating is not a number"]);
      });
      it("Throws when spot id does not exit in spots collection", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            originalSpot._id.toString(),
            receivedUserInfo._id.toString(),
            0.23,
            new Date()
          )
        ).rejects.toEqual(["Rating must be between 1 and 10 (inclusive)!"]);
      });
      it("Throws when spot id does not exit in spots collection", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            originalSpot._id.toString(),
            receivedUserInfo._id.toString(),
            10.23,
            new Date()
          )
        ).rejects.toEqual(["Rating must be between 1 and 10 (inclusive)!"]);
      });
      it("Throws when spot id does not exit in spots collection", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.putSpotRating(
            originalSpot._id.toString(),
            receivedUserInfo._id.toString(),
            10,
            new Date().setFullYear(new Date().getFullYear() + 10)
          )
        ).rejects.toEqual(["Invalid date for rating."]);
      });
    });
  });
  describe("Testing spotsData.putSpotRating functionality", () => {
    it("Addes new rating when valid data is given", async () => {
      const expectedSpotRatings = await spotsData.getRatingsBySpotId(
        originalSpot._id.toString()
      );
      const rating = await spotsData.putSpotRating(
        originalSpot._id.toString(),
        invalidUserInfo._id.toString(),
        5.5,
        new Date()
      );

      const receivedSpotRatings = await spotsData.getRatingsBySpotId(
        originalSpot._id.toString()
      );

      expect(receivedSpotRatings.length).toEqual(
        expectedSpotRatings.length + 1
      );
    });
    it("It updates the avg and total rating aggregate statists in spots collection", async () => {
      const expectedSpotRatings = await spotsData.getRatingsBySpotId(
        originalSpot._id.toString()
      );
      let rating;
      let receivedSpotRatings;
      let receivedSpot;

      rating = await spotsData.putSpotRating(
        originalSpot._id.toString(),
        invalidUserInfo._id.toString(),
        5.5,
        new Date()
      );

      receivedSpotRatings = await spotsData.getRatingsBySpotId(
        originalSpot._id.toString()
      );

      expect(receivedSpotRatings.length).toEqual(
        expectedSpotRatings.length + 1
      );

      receivedSpot = await spotsData.getSpotById(originalSpot._id.toString());
      expect(receivedSpot.averageRating).toEqual(5.5);
      expect(receivedSpot.totalRatings).toEqual(1);

      rating = await spotsData.putSpotRating(
        originalSpot._id.toString(),
        receivedUserInfo._id.toString(),
        6.923,
        new Date()
      );

      receivedSpotRatings = await spotsData.getRatingsBySpotId(
        originalSpot._id.toString()
      );

      expect(receivedSpotRatings.length).toEqual(2);

      receivedSpot = await spotsData.getSpotById(originalSpot._id.toString());
      expect(receivedSpot.totalRatings).toEqual(2);
      expect(receivedSpot.averageRating).toEqual((5.5 + 6.923) / 2);
    });
  });
  describe("Testing userData.deleteRating", () => {
    describe("Testing userData.deleteRating input validation", () => {
      it("Throws when rating is not valid ObjectId ", async () => {
        const expectedSpotRatings = await spotsData.getRatingsBySpotId(
          originalSpot._id.toString()
        );
        let rating;
        let receivedSpotRatings;
        let receivedSpot;

        rating = await spotsData.putSpotRating(
          originalSpot._id.toString(),
          invalidUserInfo._id.toString(),
          5.5,
          new Date()
        );

        receivedSpotRatings = await spotsData.getRatingsBySpotId(
          originalSpot._id.toString()
        );

        expect(receivedSpotRatings.length).toEqual(
          expectedSpotRatings.length + 1
        );

        await expect(
          spotsData.deleteRating(
            "rating._id.toString()",
            invalidUserInfo._id.toString()
          )
        ).rejects.toEqual([
          "String (rating._id.toString()) is not a valid ObjectId!",
        ]);
      });
      it("Throws when invalid user in passed in", async () => {
        const expectedSpotRatings = await spotsData.getRatingsBySpotId(
          originalSpot._id.toString()
        );
        let rating;
        let receivedSpotRatings;
        let receivedSpot;

        rating = await spotsData.putSpotRating(
          originalSpot._id.toString(),
          invalidUserInfo._id.toString(),
          5.5,
          new Date()
        );

        receivedSpotRatings = await spotsData.getRatingsBySpotId(
          originalSpot._id.toString()
        );

        expect(receivedSpotRatings.length).toEqual(
          expectedSpotRatings.length + 1
        );

        await expect(
          spotsData.deleteRating(rating._id.toString(), rating._id.toString())
        ).rejects.toEqual([
          `Could not find user with id (${rating._id.toString()})`,
        ]);
      });
      it("Throws when valid user tries to delete another user's rating", async () => {
        const expectedSpotRatings = await spotsData.getRatingsBySpotId(
          originalSpot._id.toString()
        );
        let rating;
        let receivedSpotRatings;
        let receivedSpot;

        rating = await spotsData.putSpotRating(
          originalSpot._id.toString(),
          invalidUserInfo._id.toString(),
          5.5,
          new Date()
        );

        receivedSpotRatings = await spotsData.getRatingsBySpotId(
          originalSpot._id.toString()
        );

        expect(receivedSpotRatings.length).toEqual(
          expectedSpotRatings.length + 1
        );

        await expect(
          spotsData.deleteRating(
            rating._id.toString(),
            receivedUserInfo._id.toString()
          )
        ).rejects.toEqual(["Attempting to delete another user's rating"]);
      });
    });
    describe("Testing userData.deleteRating functionality", () => {
      it("It updates the avg and total rating aggregate statists in spots collection", async () => {
        const expectedSpotRatings = await spotsData.getRatingsBySpotId(
          originalSpot._id.toString()
        );
        let rating;
        let receivedSpotRatings;
        let receivedSpot;

        rating = await spotsData.putSpotRating(
          originalSpot._id.toString(),
          invalidUserInfo._id.toString(),
          5.5,
          new Date()
        );

        receivedSpotRatings = await spotsData.getRatingsBySpotId(
          originalSpot._id.toString()
        );

        expect(receivedSpotRatings.length).toEqual(
          expectedSpotRatings.length + 1
        );

        await spotsData.deleteRating(
          rating._id.toString(),
          invalidUserInfo._id.toString()
        );

        receivedSpotRatings = await spotsData.getRatingsBySpotId(
          originalSpot._id.toString()
        );
        console.log(receivedSpotRatings);
        expect(receivedSpotRatings.length).toEqual(0);
      });
    });
  });
});
