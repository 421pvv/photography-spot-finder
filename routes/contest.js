import { contestData, spotsData, userData } from "../data/index.js";
import express from "express";
import validation from "../validation.js";
import logger from "../log.js";
import cloudinary from "../cloudinary/cloudinary.js";
import { MongoCryptKMSRequestNetworkTimeoutError, ObjectId } from "mongodb";
import {
  contestRatings,
  contestSubmissions,
  spots,
} from "../config/mongoCollections.js";
import log from "../log.js";
const router = express.Router();

router.route("/").get(async (req, res) => {
  let errors = [];

  let contestSpotsData;
  try {
    contestSpotsData = await contestData.getContestSpotsList();
  } catch (e) {
    errors.push("Failed to fetch contest spots. Please try again later.");
  }
  logger.log("Contest spots: ", contestSpotsData);

  const props = {
    spots: contestSpotsData,
    user: req.session.user,
    invalidResourceErrors: req.session.invalidResourceErrors,
    errors,
    styles: [`<link rel="stylesheet" href="/public/css/allSpots.css">`],
  };

  delete req.session.invalidResourceErrors;
  res.render("contestSpots/allSpots", props);
});

router
  .route("/:spotId")
  .get(async (req, res) => {
    let errors = [];
    let spotId;
    let spotInfo;
    let submissions;
    try {
      spotId = validation.validateString(req.params.spotId);
    } catch (e) {
      logger.log(e);
      req.session.invalidResourceErrors = [`${spotId} is not a valid id!`];
      return res.status(400).redirect("/contest");
    }

    try {
      spotInfo = await contestData.getContestSpotsById(spotId);
    } catch (e) {
      logger.log(e);
      errors = errors.concat(`No contest spot with id ${spotId} exists!`);
      req.session.invalidResourceErrors = errors;
      return res.status(404).redirect("/contest");
    }

    logger.log("Rendering spot details for :", spotId);
    logger.log(spotInfo);

    const publicSpot = {
      _id: spotInfo._id.toString(),
      spotName: spotInfo.name,
      spotDescription: spotInfo.description.split("\n"),
      spotAccessibility: spotInfo.accessibility.split("\n"),
      spotBestTimes: spotInfo.bestTimes.join(", "),
      spotTags: spotInfo.tags.join(", "),
      spotImages: spotInfo.images,
      spotAddress: spotInfo.address,
      spotLongitude: spotInfo.location.coordinates[0],
      spotLatitude: spotInfo.location.coordinates[1],
      totalRatings: spotInfo.totalRatings,
      averageRating: spotInfo.averageRating,
    };

    const viewUser = {};
    if (req.session.user) {
      viewUser._id = req.session.user._id.toString();
      viewUser.originalPoster =
        req.session.user._id.toString() === spotInfo.posterId.toString();
      try {
        await contestData.getContestSubmissionByUser(spotId, viewUser._id);
        console.log("stuff");
        viewUser.hasNotSubmitted = false;
      } catch (e) {
        logger.log("User has submitted before for contest spot: ", spotId);
        logger.log(e);
        viewUser.hasNotSubmitted = true;
      }
    }
    logger.log("viewing user info", viewUser);

    const renderProps = {
      user: req.session.user,
      styles: [
        `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">`,
        `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
        `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">`,
        `<link rel="stylesheet" href="/public/css/contestSubmission.css">`,
      ],
      scripts: [
        `<script defer src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
        `<script defer type="module" src="/public/js/contest/contest_submission.js"></script>`,
      ],
      apikey: process.env.MAPBOX_API_TOKEN,
      spot: publicSpot,
      viewingUser: viewUser,
    };

    try {
      submissions = await contestData.getSubmissionsForContestSpot(spotId);
      submissions = submissions.map((submission) => {
        submission.user = req.session.user;
        submission._id = submission._id.toString();

        return submission;
      });
      logger.log("Submissions", submissions);
      renderProps.submissions = submissions;
    } catch (e) {
      logger.log("Fetching submissions failed for: " + spotId, e);
    }

    let poster;
    try {
      poster = await userData.getUserProfileById(spotInfo.posterId.toString());
      poster._id = poster._id.toString();
      logger.log("Poster info", poster);
      renderProps.poster = poster;
    } catch (e) {
      logger.log("Fetching submission failed for: " + spotId, e);
    }

    if (req.session.addSubmission) {
      renderProps.addSubmission = req.session.addSubmission;
      logger.log("Add submission attempt present: ", renderProps.addSubmission);
    }

    res.status(200).render("contestSpots/contest_submission", renderProps);

    //clean up any previous errors
    delete req.session.addRating;
    delete req.session.addComment;
  })
  .post(async (req, res) => {
    let errors = [];
    logger.log("Contest sub received: ");
    let url = req.body.url;
    let public_id = req.body.public_id;
    let spotId = req.body.spotId;
    let spotInfo;
    if (!req.session.user) {
      errors = errors.concat("Need to be logged in to submit to a contest!");
    }

    try {
      spotId = validation.validateString(spotId, "Spot id");
      logger.log("contest spot: ", spotId);
      spotInfo = await contestData.getContestSpotsById(spotId);
    } catch (e) {
      logger.log(e);
      errors = errors.concat("Invalid contest Spot!");
    }

    //TODO: check if it's valid to still submit for this contest spot

    const submissionImage = {};
    try {
      logger.log("contest spot: ");
      submissionImage.url = validation.validateString(url, "Image Url");
      submissionImage.public_id = validation.validateString(
        public_id,
        "Image Public Id"
      );
    } catch (e) {
      logger.log(e);
      errors = errors.concat("Invalid contest image.!");
    }

    if (errors.length > 0) {
      return res
        .status(400)
        .render("partials/errors", { layout: null, errors });
    }

    try {
      const submision = await contestData.submitContestImage(
        submissionImage.url,
        submissionImage.public_id,
        req.session.user._id.toString(),
        spotId.toString(),
        new Date()
      );

      const posterInfo = await userData.getUserProfileById(
        submision.posterId.toString()
      );
      const props = {
        firstName: posterInfo.firstName,
        _id: submision._id.toString(),
        lastName: posterInfo.lastName,
        url: submision.image.url,
        createdAt: new Date(submision.createdAt).toString(),
        user: req.session.user,
      };
      return res.status(200).render("partials/submitted_image", {
        layout: null,
        ...props,
      });
    } catch (e) {
      logger.log(e);
      return res.status(500).render("partials/errors", {
        layout: null,
        errors: ["Contest submission failed!"],
      });
    }
  });

router
  .route("/:contestSpotId/userVotes")
  .get(async (req, res) => {
    let { contestSpotId } = req.params;
    try {
      contestSpotId = validation.validateString(
        contestSpotId,
        "Contest Spot Id",
        true
      );
    } catch (e) {
      return res.status(400).json({
        error: "Invalid contest spot id!",
      });
    }

    try {
      validation.validateString(req.session.user._id.toString());
    } catch (e) {
      logger.log(e);
      return res.status(401).json({
        error: "Cannot fetch user votes (not logged in)!",
      });
    }

    try {
      const ratings = await contestData.getContestSpotVotesByUser(
        req.session.user._id.toString(),
        contestSpotId
      );
      return res.status(200).json(ratings);
    } catch (e) {
      logger.log(e);
      return res.status(500).json({
        error: "Could not fetch ratings",
      });
    }
  })
  .put(async (req, res) => {
    let { contestSubmissionId, vote } = req.body;
    let errors = [];
    try {
      validation.validateNumber(vote, "Contest Vote");
      console.log(vote, typeof vote);
      if (vote !== 1 && vote !== -1) {
        throw `Contest vote can only be like (1) or dislike (-1)!`;
      }
    } catch (e) {
      logger.log(e);
      errors = errors.concat(e);
    }

    try {
      contestSubmissionId = validation.validateString(
        contestSubmissionId,
        "Contest Submission Id"
      );
    } catch (e) {
      logger.log(e);
      errors = errors.concat(e);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        errors,
      });
    }

    try {
      const contestSubmissionVote = await contestData.putContestSubmissionVote(
        contestSubmissionId,
        vote,
        req.session.user._id.toString(),
        new Date()
      );
      logger.log("Vote succesfull: ", contestSubmissionVote);
      return res.status(200).json(contestSubmissionVote);
    } catch (e) {
      logger.log(e);
      return res.status(500).json({
        error: "Contest vote submission failed! Please try again.",
      });
    }
  })
  .delete(async (req, res) => {
    let { contestSubmissionId } = req.body;
    let errors = [];
    try {
      contestSubmissionId = validation.validateString(
        contestSubmissionId,
        "Contest Submission Id"
      );
      await contestData.getContestSubmissionById(contestSubmissionId);
    } catch (e) {
      logger.log(e);
      errors = errors.concat(e);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        errors,
      });
    }

    try {
      await contestData.deleteContestSubmissionVote(
        contestSubmissionId,
        req.session.user._id.toString()
      );
      return res.status(200).json({
        deleted: true,
      });
    } catch (e) {
      return res.status(500).json({
        error: "Contest vote submission failed! Please try again.",
      });
    }
  });

export default router;
