import { users } from "../config/mongoCollections.js";
import { SALT_ROUNDS } from "../config/secrets.js";
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
    bio: "",
    email: "",
    favoriteSpots: [],
    comments: [],
    ratings: [],
    spots: [],
    contestSubmissions: [],
    contestVotes: [],
    sportReports: [],
    commentReports: [],
    contestReports: [],
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

export const updateUserProfile = async (userObject) => {
  validateObject(userObject, "Update object");
  let firstName = userObject.firstName;
  let lastName = userObject.lastName;
  let email = userObject.email;
  let bio = userObject.bio;
  let password = userObject.password;

  let errors = [];
  let updateUserProfile = {};

  if (password !== undefined) {
    try {
      validation.validatePassword(password, "Password");
      const salt = bcrypt.genSaltSync(SALT_ROUNDS);
      password = bcrypt.hashSync(password, salt);
      updateUserProfile.password = password;
    } catch (e) {
      errors = errors.concat(e);
    }
  }

  if (firstName !== undefined) {
    try {
      firstName = validation.validateString(firstName);
      updateUserProfile.firstName = firstName;
    } catch (e) {
      errors = errors.concat(e);
    }
  }

  if (lastName !== undefined) {
    try {
      lastName = validation.validateString(lastName);
      updateUserProfile.lastName = lastName;
    } catch (e) {
      errors = errors.concat(e);
    }
  }

  if (email !== undefined) {
    try {
      email = validation.validateEmail(email);
      updateUserProfile.email = email;
    } catch (e) {
      errors = errors.concat(e);
    }
  }

  if (bio !== undefined) {
    try {
      bio = validation.validateString(bio);
      updateUserProfile.bio = bio;
    } catch (e) {
      errors = errors.concat(e);
    }
  }

  if (errors.length > 0) {
    throw errors;
  }

  const filter = {
    username,
  };
  const userProfile = {
    $set: updateUserProfile,
  };

  const usersCollection = await users();
  const insertInfo = await usersCollection.updateOne(filter, userProfile);
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
      _id: 1,
      firstName: 1,
      lastName: 1,
      username: 1,
      password: 1,
    };
  } else {
    options.projection = {
      _id: 1,
      firstName: 1,
      username: 1,
      lastName: 1,
    };
  }

  const usersCollection = await users();
  const userInfo = await usersCollection.findOne(filter, options);
  if (!userInfo) throw [`Could not find user with username (${username})`];

  return userInfo;
};

const getUserProfileById = async (id) => {
  id = validation.validateString(id, "User Id", true);

  const filter = {
    _id: id,
  };

  let options = {};
  options.projection = {
    _id: 1,
    password: 0,
  };

  const usersCollection = await users();
  const userInfo = await usersCollection.findOne(filter, options);
  if (!userInfo) throw [`Could not find user with id (${id})`];

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
  getUserProfileById,
};
