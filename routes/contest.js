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
    contestSpotsData = await contestData.getContestSpotsList()
  } catch (e) {
    errors.push("Failed to fetch contest spots. Please try again later.");
  }
  logger.log("Contest spots: ", contestSpotsData);

  const props = {
    spots: contestSpotsData,
    user: req.session.user,
    errors,
    styles: [`<link rel="stylesheet" href="/public/css/allSpots.css">`],
  };

  res.render("contestSpots/allSpots", props);
});

router
  .route("/:spotId")
  .get(async (req, res) => {
    let errors = [];
    let spotId;
    let spotInfo;

    try {
      spotId = validation.validateString(req.params.spotId);
    } catch (e) {
      logger.log(e);
      req.session.invalidResourceErrors = [`${spotId} is not a valid id!`];
      return res.status(400).redirect("/spots/search");
    }

    try {
      const spotInfo = await contestData.getContestSpotsById(spotId);
      const submissions = await contestData.getSubmissionsForContestSpot(spotId);
    } catch (e) {
      logger.log(e);
      errors = errors.concat(`No contest spot with id ${spotId} exists!`);
      req.session.invalidResourceErrors = errors;
      return res.status(404).redirect("/spots/search");
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
        const viewingUserRating = await spotsData.getSpotRatingByUserId(
          spotId,
          viewUser._id
        );
        logger.log("viewing user has left rating before: ");
        logger.log(viewingUserRating);
        viewUser.rating = viewingUserRating.rating;
      } catch (e) {
        logger.log(e);
      }
    }
    logger.log("viewing user info", viewUser);

    const renderProps = {
      user: req.session.user,
      styles: [
        `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">`,
        `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
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

    let submissions;
    try {
        submissions = await contestData.getSubmissionsForContestSpot()
      //TODO replace with data func
      // submissions = await (
      //   await contestSubmissions()
      // )
      //   .aggregate([
      //     {
      //       $match: {
      //         contestSpotId: ObjectId.createFromHexString(spotId),
      //       },
      //     },
      //     {
      //       $lookup: {
      //         from: "users",
      //         localField: "posterId",
      //         foreignField: "_id",
      //         as: "poster",
      //       },
      //     },
      //     {
      //       $unwind: "$poster",
      //     },
      //     {
      //       $project: {
      //         _id: 1,
      //         url: "$image.url",
      //         createdAt: 1,
      //         firstName: "$poster.firstName",
      //         lastName: "$poster.lastName",
      //         username: "$poster.username",
      //       },
      //     },
      //   ])
      //   .toArray();

      // submissions = submissions.map((submision) => {
      //   // convert date displayble
      //   submision.createdAt = new Date(submision.createdAt).toString();
      //   submision._id = submision._id.toString();
      //   return submision;
      // });
      logger.log("Submissions", submissions);
      renderProps.submissions = submissions;
    } catch (e) {
      logger.log("Fetching comments failed for: " + spotId, e);
    }

    let poster;
    try {
      poster = await userData.getUserProfileById(spotInfo.posterId.toString());
      poster._id = poster._id.toString();
      logger.log("Poster info", poster);
      renderProps.poster = poster;
    } catch (e) {
      logger.log("Fetching comments failed for: " + spotId, e);
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

    if (!req.session.user) {
      errors = errors.concat("Need to be logged in to submit to a contest!");
    }

    try {
      spotId = validation.validateString(spotId, "Spot id");
      logger.log("contest spot: ", spotId);
      // TODO check if spot id esists in contest spots
    } catch (e) {
      logger.log(e);
      errors = errors.concat("Invalid contest Spot!");
    }

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
      //TODO replace with data func
      const contestSubmissionsCollection = await contestSubmissions();
      const result = await contestSubmissionsCollection.insertOne({
        contestSpotId: ObjectId.createFromHexString(spotId.toString()),
        image: submissionImage,
        posterId: ObjectId.createFromHexString(req.session.user._id.toString()),
        createdAt: new Date(),
        reportCount: 0,
      });
      const submision = await contestSubmissionsCollection.findOne({
        _id: ObjectId.createFromHexString(result.insertedId.toString()),
      });

      const posterInfo = await userData.getUserProfileById(
        submision.posterId.toString()
      );
      const props = {
        firstName: posterInfo.firstName,
        lastName: posterInfo.lastName,
        url: submision.image.url,
        createdAt: new Date(submision.createdAt).toString(),
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

export default router;
