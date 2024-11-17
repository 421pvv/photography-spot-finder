import { userData } from ".";
import { closeConnection } from "../config/mongoConnection.js";
import { initDB, seedDB } from "../seed/seed.js";
import { passwordPolicies } from "../validation.js";

describe("Testing user edit", () => {
  describe("Testing userData.updateUserProfile", () => {
    let receivedUserInfo;
    let receivedUserInfo1;
    let validUserInfo = {
      firstName: "Siva Anand",
      lastName: "Sivakumar",
      username: "SivaAnand1",
      password: "FakePassword#2313",
    };
    let validUserInfo1 = {
      firstName: "Dhruvish",
      lastName: "Parekh",
      username: "dhruvish",
      password: "Password@1234",
    };
    afterAll(async () => {
      await initDB();
      await seedDB();
      await closeConnection();
    });
    const userOneCopy = () => JSON.parse(JSON.stringify(receivedUserInfo));
    const userTwoCopy = () => JSON.parse(JSON.stringify(receivedUserInfo1));
    beforeEach(async () => {
      await initDB();
      validUserInfo = {
        firstName: "Siva Anand",
        lastName: "Sivakumar",
        username: "SivaAnand1",
        password: "FakePassword#2313",
      };
      validUserInfo1 = {
        firstName: "Dhruvish",
        lastName: "Parekh",
        username: "dhruvish",
        password: "Password@1234",
      };
      validUserInfo = await userData.createUser(
        validUserInfo.firstName,
        validUserInfo.lastName,
        validUserInfo.username,
        validUserInfo.password
      );
      validUserInfo1 = await userData.createUser(
        validUserInfo1.firstName,
        validUserInfo1.lastName,
        validUserInfo1.username,
        validUserInfo1.password
      );
      receivedUserInfo = await userData.getUserProfileById(
        validUserInfo._id.toString()
      );
      receivedUserInfo1 = await userData.getUserProfileById(
        validUserInfo1._id.toString()
      );
    });

    describe("Testing usersData.updateUserProfile input validation", () => {
      it("Throws when username is missing from update object", async () => {
        let user1 = userOneCopy();
        delete user1.username;
        await expect(userData.updateUserProfile(user1)).rejects.toEqual([
          "User profile update failed. Invlaid username.",
        ]);
      });
      it("Throws when no update fileds are provided", async () => {
        let user2 = userTwoCopy();
        await expect(
          userData.updateUserProfile({
            username: user2.username,
          })
        ).rejects.toEqual([
          "Must provide at leaset one update field to update user profile!",
        ]);
      });
    });

    describe("Testing usersData.updateUserProfile functionality", () => {
      it("Throws when a non-existing user tries to update the user", async () => {
        let user1 = userOneCopy();
        user1.username = "sdfhaoi234958h";
        await expect(userData.updateUserProfile(user1)).rejects.toEqual([
          "User profile update failed. Invlaid username.",
        ]);
      });
      it("Updates firstname name when valid name is provided", async () => {
        let expectedUser = userOneCopy();
        expectedUser.firstName = "Edit First Name";
        let updateObject = {
          username: expectedUser.username,
          firstName: expectedUser.firstName,
        };

        let receivedUserProfile = await userData.updateUserProfile(
          updateObject
        );
        receivedUserProfile._id = receivedUserProfile._id.toString();
        expect(receivedUserProfile).toEqual(expectedUser);
      });
      it("Updates last name when valid name is provided", async () => {
        let expectedUser = userOneCopy();
        expectedUser.lastName = "Edit Last Name";
        let updateObject = {
          username: expectedUser.username,
          lastName: expectedUser.lastName,
        };

        let receivedUserProfile = await userData.updateUserProfile(
          updateObject
        );
        receivedUserProfile._id = receivedUserProfile._id.toString();
        expect(receivedUserProfile).toEqual(expectedUser);
      });
      it("Updates bio when valid name is provided", async () => {
        let expectedUser = userOneCopy();
        expectedUser.bio = "This is new bio. My name is Last Name";
        let updateObject = {
          username: expectedUser.username,
          bio: expectedUser.bio,
        };

        let receivedUserProfile = await userData.updateUserProfile(
          updateObject
        );
        receivedUserProfile._id = receivedUserProfile._id.toString();
        expect(receivedUserProfile).toEqual(expectedUser);
      });
      it("Updates bio when valid name is provided", async () => {
        let expectedUser = userOneCopy();
        expectedUser.bio = "This is new bio. My name is Last Name";
        let updateObject = {
          username: expectedUser.username,
          password: "expect5edUser.bio,",
        };

        await userData.updateUserProfile(updateObject);
        const passwordChanged = await userData.authenticateUser(
          expectedUser.username,
          "expect5edUser.bio,"
        );
        await expect(passwordChanged).not.toEqual(false);
      });
    });
  });
});
