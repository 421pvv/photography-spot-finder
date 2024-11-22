import express from "express";
import validation from "../validation.js";
import { userData } from "../data/index.js";
import logging from "../log.js";
import { contestSubmissions } from "../config/mongoCollections.js";
const router = express.Router();

router
  .route("/signup")
  .get(async (req, res) => {
    res.render("users/signup");
  })
  .post(async (req, res) => {
    const loginData = req.body;
    console.log(loginData);
    let errors = [];
    try {
      loginData.firstName = validation.validateString(
        loginData.firstName,
        "First Name"
      );
    } catch (e) {
      errors = errors.concat([e]);
    }

    try {
      loginData.lastName = validation.validateString(
        loginData.lastName,
        "Last Name"
      );
    } catch (e) {
      errors = errors.concat([e]);
    }

    try {
      loginData.username = validation.validateUsername(
        loginData.username,
        "User Name"
      );
    } catch (e) {
      console.log(e);
      errors = errors.concat(e);
    }

    try {
      validation.validatePassword(loginData.password, "Password");
    } catch (e) {
      console.log(e);
      errors = errors.concat(e);
    }

    try {
      await userData.verifyNewUsername(loginData.username);
    } catch (e) {
      errors = errors.concat(e);
    }

    console.log(loginData);
    if (errors.length !== 0) {
      return res.render("users/signup", {
        errors,
        hasErrors: true,
        data: loginData,
      });
    }

    let userFromDb;
    try {
      userFromDb = await userData.createUser(
        loginData.firstName,
        loginData.lastName,
        loginData.username,
        loginData.password
      );
    } catch (e) {
      return res.render("users/signup", {
        errors,
        hasErrors: true,
        user: loginData,
      });
    }
    req.session.user = {
      _id: userFromDb._id.toString(),
      firstName: userFromDb.firstName,
      lastName: userFromDb.lastName,
      username: userFromDb.username,
    };
    res.redirect(`/users/profile/${req.session.user.username}`);
  });

router
  .route("/login")
  .get(async (req, res) => {
    res.render("users/login", {
      authErrors: req.session.authErrors,
      hasAuthErrors: true,
    });
    delete req.session.authErrors;
  })
  .post(async (req, res) => {
    const loginData = req.body;
    let errors = [];

    try {
      validation.validateLoginPassword(loginData.password, "Password");
    } catch (e) {
      errors = errors.concat(e);
    }

    if (errors.length !== 0) {
      return res.render("users/login", {
        errors,
        hasErrors: true,
        data: loginData,
      });
    }

    let userFromDb;
    try {
      userFromDb = await userData.authenticateUser(
        loginData.username,
        loginData.password
      );
    } catch (e) {
      errors = errors.concat("Username or Password is invalid!");
    }
    logging.log(errors);

    if (errors.length !== 0) {
      return res.render("users/login", {
        errors,
        hasErrors: true,
        data: loginData,
        user: req.session.user,
      });
    }

    req.session.user = {
      _id: userFromDb._id.toString(),
      firstName: userFromDb.firstName,
      lastName: userFromDb.lastName,
      username: userFromDb.username,
    };
    logging.log(req.session.user);
    res.redirect(`/users/profile/${req.session.user.username}`);
  });

router.route("/logout").get(async (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.route("/profile/:username").get(async (req, res) => {
  const username = req.params.username.toLowerCase();
  let userProfile;
  try {
    userProfile = await userData.getUserProfileByUsername(username);
  } catch (e) {
    return res.status(404).render("users/profile", {
      notfound: true,
      user: req.session.user,
      username: username,
    });
  }
  const userFavoriteSpots = await userData.getAndUpdateUserFavoriteSpots(
    userProfile._id
  );
  const userSubmittedSpots = await userData.getUserSubmittedSpots(
    userProfile._id
  );
  const userComments = await userData.getUserComments(userProfile._id);
  const userContestSubmissions = await userData.getUserContestSubmissions(
    userProfile._id
  );
  const userRatings = await userData.getUserRatings(userProfile._id);
  let sameUser = false;
  if (req.session.user) {
    if (userProfile._id === req.session.user._id) {
      sameUser = true;
    }
  }
  res.render("users/profile", {
    profile: userProfile,
    user: req.session.user,
    authErrors: req.session.authorizationErrors,
  });
  delete req.session.authorizationErrors;
});

export default router;
