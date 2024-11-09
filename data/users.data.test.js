import { userData } from ".";
import { closeConnection } from "../config/mongoConnection.js";
import { initDB } from "../seed.js";
import { passwordPolicies } from "../validation.js";

describe("Testing users data functions", () => {
  afterAll(async () => {
    await closeConnection();
  });
  describe("Testing userData.createUser", () => {
    let validUserInfo = (validUserInfo = {
      firstName: "Siva Anand",
      lastName: "Sivakumar",
      username: "SivaAnand1",
      password: "FakePassword#2313",
    });
    const validUserCopy = () => {
      return JSON.parse(JSON.stringify(validUserInfo));
    };
    const passwordReqs = () => passwordPolicies.map((policy) => policy.error);
    beforeEach(async () => {
      await initDB();
    });

    describe("Testing input validation", () => {
      ß;
      it("Throws when when valid firstName, lastName, username, and password are not provided", async () => {
        let expectedUserInfo;

        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = undefined;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            "FakePassword@1234"
          )
        ).rejects.toEqual([
          "Expected First Name to be of type string, but it is not provided!",
        ]);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = undefined;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            "FakePassword@1234"
          )
        ).rejects.toEqual([
          "Expected Last Name to be of type string, but it is not provided!",
        ]);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = undefined;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            "FakePassword@1234"
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is not provided!",
          "Username must have at least six characters!",
        ]);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = undefined;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Password to be of type string, but it is not provided!",
          "Password must have at least eight characters!",
          "Password must have at least one lowercase character!",
          "Password must have at least one uppercase character!",
          "Password must have at least one numeric character!",
          "Password must have at least one special character!",
        ]);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = undefined;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            "FakePassword@1234"
          )
        ).rejects.toEqual([
          "Expected First Name to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when when valid firstName, lastName, username, and password are not valid, non-empty strings", async () => {
        let expectedUserInfo;

        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = "";
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(["String First Name is empty or has only spaces!"]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = "\t \n";
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(["String First Name is empty or has only spaces!"]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = 56651;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected First Name to be of type string, but it is of type number!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = [""];
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected First Name to be of type string, but it is an array!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = { hello: 56651 };
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected First Name to be of type string, but it is of type object!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = true;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected First Name to be of type string, but it is of type boolean!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = false;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected First Name to be of type string, but it is of type boolean!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = undefined;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected First Name to be of type string, but it is not provided!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.firstName = null;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected First Name to be of type string, but it is not provided!",
        ]);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = "";
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(["String Last Name is empty or has only spaces!"]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = "\t \n";
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(["String Last Name is empty or has only spaces!"]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = 56651;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Last Name to be of type string, but it is of type number!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = [""];
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Last Name to be of type string, but it is an array!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = { hello: 56651 };
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Last Name to be of type string, but it is of type object!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = true;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Last Name to be of type string, but it is of type boolean!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = false;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Last Name to be of type string, but it is of type boolean!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = undefined;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Last Name to be of type string, but it is not provided!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.lastName = null;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Last Name to be of type string, but it is not provided!",
        ]);

        const userErrors = "Username must have at least six characters!";
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = "";
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          ["String Username is empty or has only spaces!"].concat(userErrors)
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = "\t \n";
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          ["String Username is empty or has only spaces!"].concat(userErrors)
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = 56651;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Username to be of type string, but it is of type number!",
          ].concat(userErrors)
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = [""];
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Username to be of type string, but it is an array!",
          ].concat(userErrors)
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = { hello: 56651 };
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Username to be of type string, but it is of type object!",
          ].concat(userErrors)
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = true;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Username to be of type string, but it is of type boolean!",
          ].concat(userErrors)
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = false;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Username to be of type string, but it is of type boolean!",
          ].concat(userErrors)
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = undefined;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is not provided!",
          "Username must have at least six characters!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = null;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Username to be of type string, but it is not provided!",
          ].concat(userErrors)
        );

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = "";
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          ["String Password is empty or has only spaces!"].concat(
            passwordReqs()
          )
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = 56651;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Password to be of type string, but it is of type number!",
          ].concat(passwordReqs())
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = [""];
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Password to be of type string, but it is an array!",
          ].concat(passwordReqs())
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = { hello: 56651 };
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Password to be of type string, but it is of type object!",
          ].concat(passwordReqs())
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = true;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Password to be of type string, but it is of type boolean!",
          ].concat(passwordReqs())
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = false;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Password to be of type string, but it is of type boolean!",
          ].concat(passwordReqs())
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = undefined;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Password to be of type string, but it is not provided!",
          ].concat(passwordReqs())
        );
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = null;
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(
          [
            "Expected Password to be of type string, but it is not provided!",
          ].concat(passwordReqs())
        );
      });
      it("Throws when username doesn't meet all username policies", async () => {
        let expectedUserInfo;

        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = "null";
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(["Username must have at least six characters!"]);
      });
      it("Throws when another user already has aquired the given username", async () => {
        let expectedUserInfo;

        expectedUserInfo = validUserCopy();
        await userData.createUser(
          expectedUserInfo.firstName,
          expectedUserInfo.lastName,
          expectedUserInfo.username,
          expectedUserInfo.password
        );

        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Another user is already using username (sivaanand1)",
        ]);
      });
      it("Throws when passowrd doesn't meet all password policies", async () => {
        let expectedUserInfo;
        let expectedErrors;
        const passwordReqs = () =>
          passwordPolicies.map((policy) => policy.error);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = "Ia1.";
        expectedErrors = passwordReqs();
        expectedErrors.splice(1, 4);
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(expectedErrors);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = "UUUUUUUU*2";
        expectedErrors = passwordReqs();
        expectedErrors.splice(0, 1);
        expectedErrors.splice(1, 3);

        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(expectedErrors);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = "uuuuuuu*2";
        expectedErrors = passwordReqs();
        expectedErrors.splice(0, 2);
        expectedErrors.splice(1, 2);
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(expectedErrors);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = "UUUUUU*2";
        expectedErrors = passwordReqs();
        expectedErrors.splice(0, 1);
        expectedErrors.splice(1, 3);
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(expectedErrors);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = "UUUUUUu2";
        expectedErrors = passwordReqs();
        expectedErrors.splice(0, 4);
        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(expectedErrors);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = "UUUUUUu.";
        expectedErrors = passwordReqs();
        expectedErrors.splice(0, 3);
        expectedErrors.splice(1, 1);

        await expect(
          userData.createUser(
            expectedUserInfo.firstName,
            expectedUserInfo.lastName,
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(expectedErrors);
      });
    });
    describe("Testing functionality", () => {
      it("Creates a new user when valid firstName, lastName, username, and password are provided", async () => {
        let expectedUserInfo = validUserCopy();
        const receivedUserInfo = await userData.createUser(
          expectedUserInfo.firstName,
          expectedUserInfo.lastName,
          expectedUserInfo.username,
          "FakePassword@1234"
        );
        expectedUserInfo.username = expectedUserInfo.username.toLowerCase();
        delete expectedUserInfo.password;
        expect(receivedUserInfo).toEqual(expectedUserInfo);
      });
    });
  });
  describe("Testing userData.authenticateUser", () => {
    let validUserInfo = (validUserInfo = {
      firstName: "Siva Anand",
      lastName: "Sivakumar",
      username: "SivaAnand1",
      password: "FakePassword@1234",
    });
    const validUserCopy = () => {
      return JSON.parse(JSON.stringify(validUserInfo));
    };
    const passwordReqs = () => passwordPolicies.map((policy) => policy.error);
    beforeEach(async () => {
      await initDB();
      await userData.createUser(
        validUserInfo.firstName,
        validUserInfo.lastName,
        validUserInfo.username,
        validUserInfo.password
      );
    });

    describe("Testing input validation", () => {
      it("Throws when username, and password are not provided", async () => {
        let expectedUserInfo;

        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = undefined;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is not provided!",
          "Username must have at least six characters!",
        ]);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = undefined;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Password to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when username, and password are not valid, non-empty strings", async () => {
        let expectedUserInfo;

        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = "";
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "String Username is empty or has only spaces!",
          "Username must have at least six characters!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = "\t \n";
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "String Username is empty or has only spaces!",
          "Username must have at least six characters!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = 56651;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is of type number!",
          "Username must have at least six characters!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = [""];
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is an array!",
          "Username must have at least six characters!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = { hello: 56651 };
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is of type object!",
          "Username must have at least six characters!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = true;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is of type boolean!",
          "Username must have at least six characters!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = false;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is of type boolean!",
          "Username must have at least six characters!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = undefined;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is not provided!",
          "Username must have at least six characters!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = null;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Username to be of type string, but it is not provided!",
          "Username must have at least six characters!",
        ]);

        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = "";
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(["String Password is empty or has only spaces!"]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = 56651;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Password to be of type string, but it is of type number!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = [""];
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Password to be of type string, but it is an array!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = { hello: 56651 };
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Password to be of type string, but it is of type object!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = true;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Password to be of type string, but it is of type boolean!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = false;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Password to be of type string, but it is of type boolean!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = undefined;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Password to be of type string, but it is not provided!",
        ]);
        expectedUserInfo = validUserCopy();
        expectedUserInfo.password = null;
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual([
          "Expected Password to be of type string, but it is not provided!",
        ]);
      });
      it("Throws when username doesn't meet all username policies", async () => {
        let expectedUserInfo;

        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = "null";
        await expect(
          userData.authenticateUser(
            expectedUserInfo.username,
            expectedUserInfo.password
          )
        ).rejects.toEqual(["Username must have at least six characters!"]);
      });
      it("Throws when username doesn't exist", async () => {
        let expectedUserInfo;

        expectedUserInfo = validUserCopy();
        expectedUserInfo.username = "null";
        await expect(
          userData.authenticateUser("fakeuser", expectedUserInfo.password)
        ).rejects.toEqual(["Could not find user with username (fakeuser)"]);
      });
    });
    describe("Testing functionality", () => {
      it("It returns user's info when password is valid", async () => {
        let expectedUserInfo = validUserCopy();
        const receivedUserInfo = await userData.authenticateUser(
          expectedUserInfo.username,
          "FakePassword@1234"
        );
        expectedUserInfo.username = expectedUserInfo.username.toLowerCase();
        delete expectedUserInfo.password;
        expect(receivedUserInfo).toEqual(expectedUserInfo);
      });
      it("It throw user's info when password is invalid for valid user", async () => {
        let expectedUserInfo = validUserCopy();

        await expect(
          userData.authenticateUser(expectedUserInfo.username, "fake password")
        ).rejects.toEqual(["Invalid password for user sivaanand1!"]);
      });
    });
  });
});
