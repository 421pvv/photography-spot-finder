import { userData, spotsData } from "./index.js";
import { closeConnection } from "../config/mongoConnection.js";
import { initDB, seedDB } from "../seed/seed.js";

describe("Testing comments data functions", () => {
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
  describe("Testing spotsData.addComment", () => {
    describe("Testing spotsData.addComment input validation", () => {
      it("Throws when comment message is empty", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await await expect(
          spotsData.addComment(
            originalSpot._id.toString(),
            receivedUserInfo._id.toString(),
            "  "
          )
        ).rejects.toEqual(["String Message is empty or has only spaces!"]);
      });
      it("Throws when invalid image is passed in", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const expectedComment = {
          message: "This spot is great. I'll visit soon!",
          image: { url: "test url " },
        };

        await expect(
          spotsData.addComment(
            originalSpot._id.toString(),
            receivedUserInfo._id.toString(),
            expectedComment.message,
            expectedComment.image
          )
        ).rejects.toEqual(["Invalid image object."]);
      });
    });
    describe("Testing spotsData.addComment functionality", () => {
      it("adds a comment when the a valid useer and valid comment is give", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await spotsData.addComment(
          originalSpot._id.toString(),
          receivedUserInfo._id.toString(),
          "This spot is great. I'll visit soon!"
        );
        const receivedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );
        expect(receivedSpotComments.length).toEqual(
          expectedSpotComments.length + 1
        );
        const comment = receivedSpotComments.pop();
        expect(comment.message).toEqual("This spot is great. I'll visit soon!");
        expect(comment.image).toEqual(null);
      });
      it("adds a comment when the a valid useer and valid comment is give", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const expectedComment = {
          message: "This spot is great. I'll visit soon!",
          image: { public_id: "test", url: "test url " },
        };

        const receivedComment = await spotsData.addComment(
          originalSpot._id.toString(),
          receivedUserInfo._id.toString(),
          expectedComment.message,
          expectedComment.image
        );
        const receivedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );
        expect(receivedSpotComments.length).toEqual(
          expectedSpotComments.length + 1
        );
        const comment = receivedSpotComments.pop();
        expect(comment.message).toEqual("This spot is great. I'll visit soon!");
        expect(comment.image).toEqual(expectedComment.image);
      });
    });
  });
  describe("Testing spotsData.updateComment", () => {
    describe("Testing spotsData.updateComment input validation", () => {
      let expectedSpotComment;
      beforeEach(async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const expectedComment = {
          message: "This spot is great. I'll visit soon!",
          image: { public_id: "test", url: "test url " },
        };

        expectedSpotComment = await spotsData.addComment(
          originalSpot._id.toString(),
          receivedUserInfo._id.toString(),
          expectedComment.message,
          expectedComment.image
        );
      });
      it("Throws when comment id is missing", async () => {
        const receivedComment = await expect(
          spotsData.updateComment(
            undefined,
            originalSpot._id.toString(),
            receivedUserInfo._id.toString(),
            " Changed my mind. "
          )
        ).rejects.toEqual([
          "Expected Comment Id to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when user id is missing", async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const receivedComment = await expect(
          spotsData.updateComment(
            expectedSpotComment._id.toString(),
            undefined,
            originalSpot._id.toString(),
            " Message"
          )
        ).rejects.toEqual([
          "Expected User Id to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when user is not the poster id", async () => {
        const receivedComment = await expect(
          spotsData.updateComment(
            expectedSpotComment._id.toString(),
            invalidUserInfo._id.toString(),
            " Message"
          )
        ).rejects.toEqual([
          "Attempting to update a comment that doesn't beling to the user.!",
        ]);
      });

      it("Throws when user is not the poster id", async () => {
        const receivedComment = await expect(
          spotsData.updateComment(
            expectedSpotComment._id.toString(),
            receivedUserInfo._id.toString(),
            " \t \n"
          )
        ).rejects.toEqual(["String Message is empty or has only spaces!"]);
      });
      it("Throws when invalid image is passed in ", async () => {
        const receivedComment = await expect(
          spotsData.updateComment(
            expectedSpotComment._id.toString(),
            receivedUserInfo._id.toString(),
            " Changed my mind",
            {}
          )
        ).rejects.toEqual(["Invalid image object."]);
      });
    });
    describe("Testing userData.updateComment funcitonality", () => {
      let expectedSpotComment;
      beforeEach(async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const expectedComment = {
          message: "This spot is great. I'll visit soon!",
          image: { public_id: "test", url: "test url " },
        };

        expectedSpotComment = await spotsData.addComment(
          originalSpot._id.toString(),
          receivedUserInfo._id.toString(),
          expectedComment.message,
          expectedComment.image
        );
      });
      it("Throws when invalid image is passed in ", async () => {
        const expectedComment = await spotsData.getCommentById(
          expectedSpotComment._id.toString()
        );

        expectedComment.message = "Changed my mind";
        expectedComment.image.url = "test url";
        expectedComment.image.public_id = "test publi id";
        const receivedComment = await spotsData.updateComment(
          expectedSpotComment._id.toString(),
          receivedUserInfo._id.toString(),
          expectedComment.message,
          expectedComment.image
        );

        expect(receivedComment).toEqual(expectedComment);
      });
      it("Throws when invalid image is passed in ", async () => {
        const expectedComment = await spotsData.getCommentById(
          expectedSpotComment._id.toString()
        );

        expectedComment.message = "Changed my mind";
        const receivedComment = await spotsData.updateComment(
          expectedSpotComment._id.toString(),
          receivedUserInfo._id.toString(),
          expectedComment.message
        );

        expect(receivedComment).toEqual(expectedComment);
      });
    });
  });
  describe("Testing userData.deleteComment", () => {
    describe("Testing userData.deleteComment input validation", () => {
      let expectedSpotComment;
      beforeEach(async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const expectedComment = {
          message: "This spot is great. I'll visit soon!",
          image: { public_id: "test", url: "test url " },
        };

        expectedSpotComment = await spotsData.addComment(
          originalSpot._id.toString(),
          receivedUserInfo._id.toString(),
          expectedComment.message,
          expectedComment.image
        );
      });
      it("Throws when comment id is not provided", async () => {
        await expect(
          spotsData.deleteComment(undefined, receivedUserInfo._id.toString())
        ).rejects.toEqual([
          "Expected Comment Id to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when comment id is not not a valid string", async () => {
        await expect(
          spotsData.deleteComment(45456, receivedUserInfo._id.toString())
        ).rejects.toEqual([
          "Expected Comment Id to be of type string, but it is of type number!",
        ]);
      });
      it("Throws when comment id is not not a valid string", async () => {
        await expect(
          spotsData.deleteComment("45456", receivedUserInfo._id.toString())
        ).rejects.toEqual(["String (45456) is not a valid ObjectId!"]);
      });
      it("Throws when comment id is not not a valid string", async () => {
        await expect(
          spotsData.deleteComment(
            receivedUserInfo._id.toString(),
            receivedUserInfo._id.toString()
          )
        ).rejects.toEqual([
          `No comment exists with id: ${receivedUserInfo._id.toString()}`,
        ]);
      });
      it("Throws when user id is not provided", async () => {
        await expect(
          spotsData.deleteComment(expectedSpotComment._id.toString(), undefined)
        ).rejects.toEqual([
          "Expected User Id to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when user id is not not a valid string", async () => {
        await expect(
          spotsData.deleteComment(expectedSpotComment._id.toString(), null)
        ).rejects.toEqual([
          "Expected User Id to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when user id is not not a valid string", async () => {
        await expect(
          spotsData.deleteComment(
            expectedSpotComment._id.toString(),
            "undefined"
          )
        ).rejects.toEqual(["String (undefined) is not a valid ObjectId!"]);
      });
    });
    describe("Testing userData.deleteComment funcitonality", () => {
      let expectedSpotComment;
      beforeEach(async () => {
        const expectedSpotComments = await spotsData.getCommentsBySpotId(
          originalSpot._id.toString()
        );

        const expectedComment = {
          message: "This spot is great. I'll visit soon!",
          image: { public_id: "test", url: "test url " },
        };

        expectedSpotComment = await spotsData.addComment(
          originalSpot._id.toString(),
          receivedUserInfo._id.toString(),
          expectedComment.message,
          expectedComment.image
        );
      });
      it("Throws when a user tries to delete a comment that doesn't belong to them", async () => {
        await expect(
          spotsData.deleteComment(
            expectedSpotComment._id.toString(),
            invalidUserInfo._id.toString()
          )
        ).rejects.toEqual([
          "Attempting to delete a comment but user is the original commenter!",
        ]);
      });
      it("Deletes the comment when the posting user tries to", async () => {
        const comment = await spotsData.deleteComment(
          expectedSpotComment._id.toString(),
          receivedUserInfo._id.toString()
        );

        await expect(
          spotsData.getCommentById(comment._id.toString())
        ).rejects.toEqual([
          `No comment exists with id: ${expectedSpotComment._id.toString()}`,
        ]);
      });
    });
  });
});
