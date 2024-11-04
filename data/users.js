import { users } from "../config/mongoCollections.js";
import { SALT_ROUNDS } from "../secrets_config.js";
import validation from "../validation.js";
import bcrypt from "bcrypt";
import logging from "../log.js";

export const createUser = async (firstName, lastName, username, password) => {
  firstName = validation.validateString(firstName, "First Name");
  lastName = validation.validateString(lastName, "Last Name");
  username = validation.validateUsername(username, "Username");
  validation.validatePassword(password, "Password");

  // verify no current user has the given username
  await verifyNewUsername(username);
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const encryptedPassword = bcrypt.hashSync(password, salt);

  const newUser = {
    firstName,
    lastName,
    username,
    password: encryptedPassword,
  };

  const usersCollection = await users();
  const insertInfo = await usersCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not add the new user";

  const userInfo = await getUserByUsername(username);
  return userInfo;
};

const authenticateUser = async (username, password) => {
  username = validation.validateUsername(username, "Username");
  validation.validateLoginPassword(password, "Password");

  const filter = {
    username,
    password,
  };

  const userInfo = await getUserByUsername(username, true);
  if (await bcrypt.compare(password, userInfo.password)) {
    return await getUserByUsername(userInfo.username);
  } else {
    throw [`Invalid password for user ${username}!`];
  }
};

const getUserByUsername = async (username, includePassword) => {
  username = validation.validateUsername(username, "Username");
  if (includePassword)
    validation.validateBoolean(includePassword, "Include Password");

  const filter = {
    username,
  };

  let options = {};
  if (includePassword && includePassword === true) {
    options.projection = {
      _id: 0,
    };
  } else {
    options.projection = {
      _id: 0,
      password: 0,
    };
  }

  const usersCollection = await users();
  const userInfo = await usersCollection.findOne(filter, options);
  if (!userInfo) throw [`Could not find user with username (${username})`];

  return userInfo;
};

const verifyNewUsername = async (username) => {
  let userExists = false;
  try {
    const user = await getUserByUsername(username);
    if (user && user.username === username) {
      userExists = true;
    }
  } catch (e) {}

  if (userExists)
    throw [`Another user is already using username (${username})`];
};

export default {
  createUser,
  getUserByUsername,
  authenticateUser,
  verifyNewUsername,
};
