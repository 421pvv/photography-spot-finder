import { spotsData, userData } from "../data/index.js";
import express from "express";
import validation from "../validation.js";
import logger from "../log.js";
import cloudinary from "../cloudinary/cloudinary.js";
import { MongoCryptKMSRequestNetworkTimeoutError } from "mongodb";
import { contestRatings, spots } from "../config/mongoCollections.js";
import log from "../log.js";
const router = express.Router();

router.route("/comment/flag/:commentId").post(async (req, res) => {
  let { commentId } = req.params;
  let userInfo;

  try {
    commentId = validation.validateString(req.params.commentId);
    await spotsData.getCommentById(commentId);
  } catch (e) {
    logger.log(e);
    req.session.invalidResourceErrors = [`${commentId} is not a valid id!`];
    return res.status(400).json({
      error: `Comment info fetch failed!`,
    });
  }

  try {
    userInfo = await userData.getUserProfileById(
      req.session.user._id.toString()
    );
  } catch (e) {
    logger.log(e);

    return res.status(400).json({
      error: `User info fetch failed!`,
    });
  }

  try {
    await userData.reportComment(userInfo._id.toString(), commentId);
    return res.status(200).json({
      flagSpot: "succesful",
    });
  } catch (e) {
    try {
      if (e[0] == "User already reported the comment") {
        return res.status(406).json({
          error: "You have already reported the comment!",
        });
      }
    } catch (e) {}
    logger.log(e);
    return res.status(500).json({
      error: "Flag comment failed!",
    });
  }
});

router.route("/flag/:spotId").post(async (req, res) => {
  let { spotId } = req.params;
  let userInfo;

  try {
    spotId = validation.validateString(req.params.spotId);
    await spotsData.getSpotById(spotId);
  } catch (e) {
    logger.log(e);
    req.session.invalidResourceErrors = [`${spotId} is not a valid id!`];
    return res.status(400).redirect("/spots/search");
  }

  try {
    userInfo = await userData.getUserProfileById(
      req.session.user._id.toString()
    );
  } catch (e) {
    logger.log(e);

    return res.status(400).json({
      error: `User info fetch failed!`,
    });
  }

  try {
    await userData.reportSpot(userInfo._id.toString(), spotId);
    return res.status(200).json({
      flagSpot: "succesful",
    });
  } catch (e) {
    logger.log(e);
    try {
      if (e[0] === "User already reported the spot") {
        return res.status(406).json({
          error: "You have already reported this spot!",
        });
      }
    } catch (e) {}
    return res.status(500).json({
      error: "Favorite spot failed!",
    });
  }
});

router.route("/favorite/:spotId").put(async (req, res) => {
  let { spotId } = req.params;
  let userInfo;
  logger.log("Attempting to favorite spot: ", spotId, req.session.user);

  try {
    spotId = validation.validateString(req.params.spotId);
    await spotsData.getSpotById(spotId);
  } catch (e) {
    logger.log(e);
    req.session.invalidResourceErrors = [`${spotId} is not a valid id!`];
    return res.status(400).redirect("/spots/search");
  }

  try {
    userInfo = await userData.getUserProfileById(
      req.session.user._id.toString()
    );
  } catch (e) {
    logger.log(e);

    return res.status(400).json({
      error: `User info fetch failed!`,
    });
  }

  try {
    await userData.putFavoriteSpot(userInfo._id.toString(), spotId);
    return res.status(200).json({
      favoriteSpot: "succesful",
    });
  } catch (e) {
    logger.log(e);

    return res.status(500).json({
      error: "Favorite spot failed!",
    });
  }
});

router.route("/details/:spotId").get(async (req, res) => {
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
    spotInfo = await spotsData.getSpotById(spotId);
  } catch (e) {
    logger.log(e);
    errors = errors.concat(`No spot with id ${spotId} exists!`);
    req.session.invalidResourceErrors = errors;
    return res.status(404).redirect("/spots/search");
  }

  if (spotInfo.reportCount >= 20) {
    if (req.session.user) {
      if (req.session.user.role !== "admin") {
        errors.push(
          "The spot you are trying to access is flagged by many users. Please wait till an Admin reviews it before trying to view it!"
        );
      }
    } else {
      errors.push(
        "The spot you are trying to access is flagged by many users. Please wait till an Admin reviews it before trying to view it!"
      );
    }
  }

  if (errors.length > 0) {
    logger.log(`Invalid session (${req.sessionID}) tried to access ${spotId}`);
    req.session.invalidResourceErrors = errors;
    return res.status(401).redirect("/spots/search");
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
  let flaggedComments;

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

    try {
      const userInfo = await userData.getUserProfileById(viewUser._id);
      if (userInfo.favoriteSpots.includes(spotId)) {
        viewUser.favorite = "favorite";
      } else {
        viewUser.favorite = "";
      }
      if (userInfo.spotReports.includes(spotId)) {
        viewUser.flag = "flagged";
      } else {
        viewUser.flag = "";
      }
      flaggedComments = userInfo.commentReports;
    } catch (e) {
      logger.log(e);
    }
  }
  logger.log("viewing user info", viewUser);

  const renderProps = {
    user: req.session.user,
    styles: [
      `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">`,
      `<link rel="stylesheet" href="/public/css/spotDetail.css">`,
      `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">`,
      `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
    ],
    scripts: [
      `<script defer src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
    ],
    apikey: process.env.MAPBOX_API_TOKEN,
    spot: publicSpot,
    viewingUser: viewUser,
  };

  let comments;
  try {
    comments = await spotsData.getDisplayCommentsBySpotId(spotId);
    comments = comments.map((comment) => {
      comment._id = comment._id.toString();
      logger.log(comment.createdAt instanceof Date);
      comment.createdAt = new Date(comment.createdAt).toString();
      if (!comment.image) {
        delete comment.image;
      }
      comment.poster = comment.poster[0];
      if (flaggedComments && flaggedComments.includes(comment._id)) {
        comment.flag = "flagged";
      } else {
        comment.flag = "";
      }
      comment.canInteract = req.session.user !== undefined;
      return comment;
    });
    logger.log("Comments", comments);
    renderProps.comments = comments;
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

  if (req.session.addRating) {
    renderProps.addRating = JSON.parse(JSON.stringify(req.session.addRating));
    logger.log("Add rating attempt present: ", renderProps.addRating);
  }

  if (req.session.addComment) {
    renderProps.addComment = JSON.parse(JSON.stringify(req.session.addComment));
    if (!renderProps.addComment.image) {
      renderProps.addComment.image;
    }
    logger.log("Add comment attempt present: ", renderProps.addComment);
  }

  res.status(200).render("spots/spotDetail", renderProps);

  //clean up any previous errors
  delete req.session.addRating;
  delete req.session.addComment;
});

router.route("/addComment/:spotId").post(async (req, res) => {
  let spotId = req.params.spotId;
  let discardImages = req.body.orphanImages;

  const comment = {
    message: req.body.message,
    errors: [],
  };

  logger.log("Potential comment: ", comment);

  try {
    spotId = validation.validateString(spotId, "Spot Id", true);
  } catch (e) {
    logger.log(e);
    comment.errors = comment.errors.concat("Invalid Spot Id");
    req.session.addComment = comment;
    return res.status(400).redirect("/spots/details/" + spotId);
  }

  let spotInfo;
  try {
    spotInfo = await spotsData.getSpotById(spotId);
  } catch (e) {
    logger.log(e);
    comment.errors = comment.errors.concat(e);
    req.session.addComment = comment;
    return res.status(400).redirect("/spots/details/" + spotId);
  }

  if (req.body.image && req.body.image !== "[]") {
    try {
      comment.image = JSON.parse(req.body.image);
      validation.validateObject(comment.image, "Image Object");

      if (!comment.image.public_id || !comment.image.url) {
        delete comment.image;
        throw "Image Object is missing properties. Try to upload image again.";
      }
    } catch (e) {
      logger.log(e);
      comment.errors = comment.errors.concat(
        "Image Object is missing properties. Try to upload image again."
      );
      req.session.addComment = comment;
      return res.status(400).redirect("/spots/details/" + spotId);
    }
  }

  try {
    comment.message = validation.validateString(comment.message);
  } catch (e) {
    logger.log(e);
    comment.errors = comment.errors.concat(
      "Invalid comment message (message must be non-empty string)!"
    );
    req.session.addComment = comment;
    return res.status(400).redirect("/spots/details/" + spotId);
  }

  try {
    await spotsData.addComment(
      spotId,
      req.session.user._id.toString(),
      comment.message,
      new Date(),
      comment.image
    );
    res.status(200).redirect("/spots/details/" + spotId);
  } catch (e) {
    logger.log(e);
    comment.errors = ["Add rating failed. Please try again."];
    req.session.addComment = comment;
    res.status(400).redirect("/spots/details/" + spotId);
  }

  // delete orphan images from cloud
  if (discardImages) {
    const spotDiscardedImages = JSON.parse(discardImages);
    for (const public_id of spotDiscardedImages) {
      try {
        cloudinary.uploader.destroy(public_id);
      } catch (e) {
        logger.log(e);
      }
    }
  }
});

router.route("/putRating/:spotId").put(async (req, res) => {
  let errors = [];
  let rating = req.body.rating;
  logger.log("Potential rating: ", rating);

  let posterId = req.session.user._id.toString();
  let spotId;
  let spotInfo;
  try {
    spotId = validation.validateString(req.params.spotId, "Spot Id", true);
    spotInfo = await spotsData.getSpotById(spotId);
  } catch (e) {
    logger.log(e);
    errors = errors.concat("Invalid spot id!");
  }

  try {
    rating = parseFloat(rating);
    validation.validateNumber(rating, "Spot Rating");
    if (rating < 1 || rating > 10) {
      throw "Spot rating must be between one and 10!";
    }
  } catch (e) {
    logger.log(e);
    errors.concat("Spot rating must be between one and 10!");
  }

  if (errors.length > 0) {
    logger.log("Rating put failed for user: ", posterId);
    logger.log(rating, errors);
    req.session.spotRatingErrors = errors;
    return res.status(400).redirect(`/spots/details/${spotId}`);
  }

  try {
    await spotsData.putSpotRating(spotId, posterId, rating, new Date());
  } catch (e) {
    logger.log("Rating put failed for user: ", posterId);
    logger.log(errors);
    errors.concat("Rating submission failed. Please try again.");
    req.session.spotRatingErrors = errors;
    return res.status(500).redirect(`/spots/details/${spotId}`);
  }
  return res.status(200).redirect(`/spots/details/${spotId}`);
});

router
  .route("/edit/:spotId")
  .get(async (req, res) => {
    let errors = [];

    let spotId;
    let spotInfo;
    try {
      spotId = validation.validateString(req.params.spotId);
    } catch (e) {
      logger.log(e);
      errors = errors.concat(e);
    }

    try {
      spotInfo = await spotsData.getSpotById(spotId);
      if (
        !req.session.user ||
        req.session.user._id.toString() !== spotInfo.posterId.toString()
      ) {
        errors.push(`You tried to modify an spot that doesn't belong to you!`);
      }
    } catch (e) {
      logger.log(e);
      errors = errors.concat(e);
    }

    if (errors.length > 0) {
      logger.log(
        `Invalid session (${req.sessionID}) tried to modify ${spotId}`
      );
      req.session.authorizationErrors = errors;
      return res.status(401).redirect("/users/login");
    }

    if (spotInfo.reportCount >= 20) {
      errors.push(
        "The Spot is flagged by many users. Please wait till an Admin reviews it before modifying!"
      );
    }

    if (errors.length > 0) {
      logger.log(
        `Invalid session (${req.sessionID}) tried to modify ${spotId}`
      );
      req.session.invalidResourceErrors = errors;
      return res.status(401).redirect("/spots/search");
    }

    logger.log("Rendering edit spot for :", spotId);
    logger.log(spotInfo);

    const publicSpot = {
      _id: spotInfo._id.toString(),
      spotName: spotInfo.name,
      spotDescription: spotInfo.description,
      spotAccessibility: spotInfo.accessibility,
      spotDescription: spotInfo.description,
      spotAccessibility: spotInfo.accessibility,
      spotBestTimes: spotInfo.bestTimes.join(","),
      spotTags: spotInfo.tags.join(","),
      spotImages: spotInfo.images,
      spotAddress: spotInfo.address,
      spotLongitude: spotInfo.location.coordinates[0],
      spotLatitude: spotInfo.location.coordinates[1],
    };
    res.render("spots/editSpot", {
      user: req.session.user,
      styles: [
        `<link rel="stylesheet" href="/public/css/addSpot.css">`,
        `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">`,
        `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
      ],
      scripts: [
        `<script id="search-js" defer src="https://api.mapbox.com/search-js/v1.0.0-beta.21/web.js"></script>`,
        `<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>`,
        `<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.min.js"></script>`,
        `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
      ],
      apikey: process.env.MAPBOX_API_TOKEN,
      spot: publicSpot,
    });
  })
  .put(async (req, res) => {
    const newSpot = {
      spotName: req.body.spotName,
      spotDescription: req.body.spotDescription,
      spotAccessibility: req.body.spotAccessibility,
      spotBestTimes: req.body.spotBestTimes,
      spotTags: req.body.spotTags,
      spotImages: req.body.spotImages,
      spotLongitude: req.body.spotLongitude,
      spotAddress: req.body.spotAddress,
      spotLatitude: req.body.spotLatitude,
      geometrySave: req.body.geometrySave,
    };
    let errors = [];

    let spotId;
    let spotInfo;
    try {
      spotId = validation.validateString(req.params.spotId);
    } catch (e) {
      logger.log(e);
      errors = errors.concat(e);
    }

    try {
      spotInfo = await spotsData.getSpotById(spotId);
      if (
        !req.session.user ||
        req.session.user._id.toString() !== spotInfo.posterId.toString()
      ) {
        errors.push(`You tried to modify an spot that doesn't belong to you!`);
      }
    } catch (e) {
      logger.log(e);
      errors = errors.concat(e);
    }

    if (errors.length > 0) {
      logger.log(
        `Invalid session (${req.sessionID}) tried to modify ${spotId}`
      );
      req.session.authErrors = errors;
      return res.status(401).redirect("/users/login");
    }

    logger.log("Trying to create new spot:");
    logger.log(newSpot);
    try {
      newSpot.spotName = validation.validateString(newSpot.spotName);
    } catch (e) {
      errors.error_spotName = [`Spot Name must not be blank or just spaces!`];
    }

    try {
      newSpot.spotDescription = validation.validateString(
        newSpot.spotDescription
      );
    } catch (e) {
      errors.error_spotDescription = [
        `Spot Description must not be blank or just spaces!`,
      ];
    }

    try {
      newSpot.spotAccessibility = validation.validateString(
        newSpot.spotAccessibility
      );
    } catch (e) {
      errors.error_spotAccessibility = [
        `Spot Accessibility  must not be blank or just spaces!`,
      ];
    }

    let bestTimes = newSpot.spotBestTimes.split(",");

    if (bestTimes.length == 0) {
      errors.error_spotBestTimes = "Must provide at least one tag for spot";
    }
    let tagErrors = [];
    for (const tagI in bestTimes) {
      try {
        bestTimes[tagI] = validation.validateString(bestTimes[tagI]);
      } catch (e) {
        tagErrors.push(
          `Invalid best time: "${bestTimes[tagI]}". A best time cannot be blank or just spaces.`
        );
      }
    }
    if (tagErrors.length > 0) {
      errors.error_spotBestTimes = tagErrors;
    } else {
      newSpot.spotBestTimes = bestTimes;
    }

    if (
      typeof newSpot.spotTags === "string" &&
      newSpot.spotTags.trim().length !== 0
    ) {
      const tags = newSpot.spotTags.split(",");
      tagErrors = [];
      for (const tagI in tags) {
        try {
          tags[tagI] = validation.validateString(tags[tagI]);
        } catch (e) {
          tagErrors.push(
            `Invalid tag: "${tags[tagI]}". A tag cannot be blank or just spaces.`
          );
        }
      }
      if (Array.isArray(tags) && tags.length > 5) {
        tagErrors.push(`A maximum of five tags is allowed`);
      }
      if (tagErrors.length > 0) {
        errors.error_spotTags = tagErrors;
      } else {
        newSpot.spotTags = tags;
      }
    } else {
      newSpot.spotTags = [];
    }

    try {
      validation.validateCoordinates(
        newSpot.spotLongitude,
        newSpot.spotLatitude
      );
      newSpot.spotLatitude = parseFloat(newSpot.spotLatitude);
      newSpot.spotLongitude = parseFloat(newSpot.spotLongitude);
      newSpot.spotAddress = validation.validateString(newSpot.spotAddress);
    } catch (e) {
      logger.log("error", e);
      errors.error_spotLocation = [
        `Please use the map above to select the location!`,
      ];
    }

    try {
      newSpot.spotImages = JSON.parse(newSpot.spotImages);
    } catch (e) {
      errors.error_spotImages = [
        `Please upload at least one image of the spot!`,
      ];
    }
    if (Array.isArray(newSpot.spotImages) && newSpot.spotImages.length > 3) {
      errors.error_spotImages = [`Please upload a maximum of three images!`];
    }

    try {
      newSpot.geometrySave = JSON.stringify(JSON.parse(newSpot.geometrySave));
    } catch (e) {}

    if (Object.keys(errors).length > 0) {
      if (!errors.error_spotImages) {
        for (const image of newSpot.spotImages) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (e) {}
        }
      }
      if (!errors.error_spotImages) {
        errors.error_spotImages = [`Please re-upload your images.`];
      }
      logger.log(errors);

      return res.status(400).render("spots/editSpot", {
        user: req.session.user,
        styles: [
          `<link rel="stylesheet" href="/public/css/addSpot.css">`,
          `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" >`,
          `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
        ],
        scripts: [
          `<script id="search-js" defer src="https://api.mapbox.com/search-js/v1.0.0-beta.21/web.js"></script>`,
          `<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>`,
          `<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.min.js"></script>`,
          `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
        ],
        apikey: process.env.MAPBOX_API_TOKEN,
        errors,
        spot: newSpot,
      });
    }
    try {
      const spotDiscardedImages = JSON.parse(req.body.spotDiscardedImages);
      for (const public_id of spotDiscardedImages) {
        try {
          cloudinary.uploader.destroy(public_id);
        } catch (e) {}
      }
    } catch (e) {}

    const spot = {
      name: newSpot.spotName,
      location: {
        type: "Point",
        coordinates: [newSpot.spotLongitude, newSpot.spotLatitude],
      },
      address: newSpot.spotAddress,
      description: newSpot.spotDescription,
      accessibility: newSpot.spotAccessibility,
      bestTimes: newSpot.spotBestTimes,
      images: newSpot.spotImages,
      tags: newSpot.spotTags,
    };
    logger.log("Attempting to insert spot");
    logger.log(spot);
    try {
      await spotsData.updateSpot(spotId, req.session.user._id.toString(), spot);
      return res.status(200).redirect(`/spots/details/${spotId}`);
    } catch (e) {
      logger.log(e);
      return res.status(500).render("spots/editSpot", {
        user: req.session.user,
        styles: [
          `<link rel="stylesheet" href="/public/css/addSpot.css">`,
          `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" >`,
          `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
        ],
        scripts: [
          `<script id="search-js" defer src="https://api.mapbox.com/search-js/v1.0.0-beta.21/web.js"></script>`,
          `<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>`,
          `<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.min.js"></script>`,
          `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
        ],
        apikey: process.env.MAPBOX_API_TOKEN,
        errors: {
          server_errors: ["Spot submission failed! Please try again."],
          error_spotImages: [`Please re-upload your images.`],
        },
        spot: newSpot,
      });
    }
  });

router
  .route("/new")
  .get(async (req, res) => {
    res.render("spots/addSpot", {
      user: req.session.user,
      styles: [
        `<link rel="stylesheet" href="/public/css/addSpot.css">`,
        `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">`,
        `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
      ],
      scripts: [
        `<script id="search-js" defer src="https://api.mapbox.com/search-js/v1.0.0-beta.21/web.js"></script>`,
        `<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>`,
        `<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.min.js"></script>`,
        `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
      ],
      apikey: process.env.MAPBOX_API_TOKEN,
    });
  })
  .post(async (req, res) => {
    const newSpot = {
      spotName: req.body.spotName,
      spotDescription: req.body.spotDescription,
      spotAccessibility: req.body.spotAccessibility,
      spotBestTimes: req.body.spotBestTimes,
      spotTags: req.body.spotTags,
      spotImages: req.body.spotImages,
      spotLongitude: req.body.spotLongitude,
      spotAddress: req.body.spotAddress,
      spotLatitude: req.body.spotLatitude,
      geometrySave: req.body.geometrySave,
    };
    const errors = {};
    logger.log("Trying to create new spot:");
    logger.log(newSpot);
    try {
      newSpot.spotName = validation.validateString(newSpot.spotName);
    } catch (e) {
      errors.error_spotName = [`Spot Name must not be blank or just spaces!`];
    }

    try {
      newSpot.spotDescription = validation.validateString(
        newSpot.spotDescription
      );
    } catch (e) {
      errors.error_spotDescription = [
        `Spot Description must not be blank or just spaces!`,
      ];
    }

    try {
      newSpot.spotAccessibility = validation.validateString(
        newSpot.spotAccessibility
      );
    } catch (e) {
      errors.error_spotAccessibility = [
        `Spot Accessibility  must not be blank or just spaces!`,
      ];
    }

    let bestTimes = newSpot.spotBestTimes.split(",");

    if (bestTimes.length == 0) {
      errors.error_spotBestTimes = "Must provide at least one tag for spot";
    }
    let tagErrors = [];
    for (const tagI in bestTimes) {
      try {
        bestTimes[tagI] = validation.validateString(bestTimes[tagI]);
      } catch (e) {
        tagErrors.push(
          `Invalid best time: "${bestTimes[tagI]}". A best time cannot be blank or just spaces.`
        );
      }
    }
    if (tagErrors.length > 0) {
      errors.error_spotBestTimes = tagErrors;
    } else {
      newSpot.spotBestTimes = bestTimes;
    }

    if (
      typeof newSpot.spotTags === "string" &&
      newSpot.spotTags.trim().length !== 0
    ) {
      const tags = newSpot.spotTags.split(",");
      tagErrors = [];
      for (const tagI in tags) {
        try {
          tags[tagI] = validation.validateString(tags[tagI]);
        } catch (e) {
          tagErrors.push(
            `Invalid tag: "${tags[tagI]}". A tag cannot be blank or just spaces.`
          );
        }
      }
      if (Array.isArray(tags) && tags.length > 5) {
        tagErrors.push(`A maximum of five tags is allowed`);
      }
      if (tagErrors.length > 0) {
        errors.error_spotTags = tagErrors;
      } else {
        newSpot.spotTags = tags;
      }
    } else {
      newSpot.spotTags = [];
    }

    try {
      validation.validateCoordinates(
        newSpot.spotLongitude,
        newSpot.spotLatitude
      );
      newSpot.spotLatitude = parseFloat(newSpot.spotLatitude);
      newSpot.spotLongitude = parseFloat(newSpot.spotLongitude);
      newSpot.spotAddress = validation.validateString(newSpot.spotAddress);
    } catch (e) {
      logger.log("error", e);
      errors.error_spotLocation = [
        `Please use the map above to select the location!`,
      ];
    }

    try {
      newSpot.spotImages = JSON.parse(newSpot.spotImages);
    } catch (e) {
      errors.error_spotImages = [
        `Please upload at least one image of the spot!`,
      ];
    }
    if (Array.isArray(newSpot.spotImages) && newSpot.spotImages.length > 3) {
      errors.error_spotImages = [`Please upload a maximum of three images!`];
    }

    try {
      newSpot.geometrySave = JSON.stringify(JSON.parse(newSpot.geometrySave));
    } catch (e) {}

    if (Object.keys(errors).length > 0) {
      if (!errors.error_spotImages) {
        for (const image of newSpot.spotImages) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (e) {}
        }
      }
      if (!errors.error_spotImages) {
        errors.error_spotImages = [`Please re-upload your images.`];
      }
      logger.log(errors);

      return res.status(400).render("spots/addSpot", {
        user: req.session.user,
        styles: [
          `<link rel="stylesheet" href="/public/css/addSpot.css">`,
          `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" >`,
          `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
        ],
        scripts: [
          `<script id="search-js" defer src="https://api.mapbox.com/search-js/v1.0.0-beta.21/web.js"></script>`,
          `<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>`,
          `<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.min.js"></script>`,
          `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
        ],
        apikey: process.env.MAPBOX_API_TOKEN,
        errors,
        spot: newSpot,
      });
    }
    try {
      const spotDiscardedImages = JSON.parse(req.body.spotDiscardedImages);
      for (const public_id of spotDiscardedImages) {
        try {
          cloudinary.uploader.destroy(public_id);
        } catch (e) {}
      }
    } catch (e) {}

    const spot = {
      name: newSpot.spotName,
      location: {
        type: "Point",
        coordinates: [newSpot.spotLongitude, newSpot.spotLatitude],
      },
      address: newSpot.spotAddress,
      description: newSpot.spotDescription,
      accessibility: newSpot.spotAccessibility,
      bestTimes: newSpot.spotBestTimes,
      images: newSpot.spotImages,
      tags: newSpot.spotTags,
      posterId: req.session.user._id,
      createdAt: new Date(),
    };
    logger.log("Attempting to insert spot");
    logger.log(spot);
    try {
      const newSpot = await spotsData.createSpot(
        spot.name,
        spot.location,
        spot.address,
        spot.description,
        spot.accessibility,
        spot.bestTimes,
        spot.images,
        spot.tags,
        spot.posterId,
        spot.createdAt
      );
      return res
        .status(200)
        .redirect(`/spots/details/${newSpot._id.toString()}`);
    } catch (e) {
      logger.log(e);
      return res.status(500).render("spots/addSpot", {
        user: req.session.user,
        styles: [
          `<link rel="stylesheet" href="/public/css/addSpot.css">`,
          `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" >`,
          `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
        ],
        scripts: [
          `<script id="search-js" defer src="https://api.mapbox.com/search-js/v1.0.0-beta.21/web.js"></script>`,
          `<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>`,
          `<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.min.js"></script>`,
          `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
        ],
        apikey: process.env.MAPBOX_API_TOKEN,
        errors: {
          server_errors: ["Spot submission failed! Please try again."],
          error_spotImages: [`Please re-upload your images.`],
        },
        spot: newSpot,
      });
    }
  });

router.route("/allSpots").get(async (req, res) => {
  const allSpots = await spotsData.getAllSpots(undefined, {});
  res.render("spots/allSpots", {
    spots: allSpots,
    styles: [`<link rel="stylesheet" href="/public/css/allSpots.css">`],
    scripts: [
      `<script type="module" src="/public/js/spots/filters.js"></script>`,
    ],
    user: req.session.user,
  });
});

router.route("/search").get(async (req, res) => {
  let keyword = req.query.keyword;
  let { tags, minRating, fromDate, toDate } = req.query;
  let filter = {};
  let errors = [];

  if (keyword) {
    try {
      keyword = validation.validateString(keyword);
    } catch (e) {
      logger.log(e);
      return res.status(400).render("spots/allSpots", {
        spots: [],
        user: req.session.user,
        styles: [`<link rel="stylesheet" href="/public/css/allSpots.css">`],
        scripts: [
          `<script type="module" src="/public/js/spots/filters.js"></script>`,
        ],
        keyword: keyword,
        errors: ["Invalid filter keyword"],
      });
    }
  }
  if (keyword === "") {
    keyword = undefined;
  }

  try {
    if (tags) {
      tags = tags.split(",");
      for (const tagI in tags) {
        let tag = tags[tagI];
        tags[tagI] = validation.validateString(tag, "tag");
      }
    }
  } catch (e) {
    logger(e);
    errors = errors.concat(e);
  }

  filter.tag = tags;

  try {
    if (minRating) {
      minRating = parseFloat(minRating);
      validation.validateNumber(minRating);
      if (minRating > 10 || minRating < 0) {
        errors.push("Min Rating must be between 0 and 10 (inclusive)");
      }
      filter.minRating = minRating;
    }
  } catch (e) {
    logger(e);
    errors = errors.concat(e);
  }

  try {
    if (fromDate) {
      validation.validateString(fromDate);
      try {
        fromDate = new Date(fromDate);
      } catch (e) {
        throw "From date is invalid";
      }

      if (isNaN(fromDate)) {
        errors.push("From date is invalid");
      } else if (fromDate < new Date(2024, 10, 1)) {
        errors.push("From date must be after or on November 1, 2024");
      }

      filter.fromDate = fromDate;
    }
  } catch (e) {
    logger(e);
    errors = errors.concat(e);
  }

  try {
    if (toDate) {
      validation.validateString(toDate);
      try {
        toDate = new Date(toDate);
      } catch (e) {
        errors.push("To date is invalid");
      }

      if (isNaN(toDate)) {
        throw "To date is invalid";
      } else if (toDate > new Date()) {
        throw "To date cannot be after current time";
      }

      filter.toDate = toDate;
    }
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  logger.log("Fetching all spots with keyword: ", keyword);
  logger.log(filter);
  try {
    const spots = await spotsData.getAllSpots(keyword, filter);
    res.render("spots/allSpots", {
      spots: spots,
      styles: [`<link rel="stylesheet" href="/public/css/allSpots.css">`],
      scripts: [
        `<script type="module" src="/public/js/spots/filters.js"></script>`,
      ],
      user: req.session.user,
      keyword: keyword,
      invalidResourceErrors: req.session.invalidResourceErrors,
    });
    delete req.session.invalidResourceErrors;
    return;
  } catch (e) {
    logger.log(e);
    res.status(500).render("spots/allSpots", {
      spots: [],
      user: req.session.user,
      keyword: keyword,
      styles: [`<link rel="stylesheet" href="/public/css/allSpots.css">`],
      scripts: [
        `<script type="module" src="/public/js/spots/filters.js"></script>`,
      ],
      errors: ["There was a server error. Please try again."],
    });
  }
});

router.route("/:spotId").delete(async (req, res) => {
  let errors = [];
  let spotId;
  let spotInfo;
  try {
    spotId = validation.validateString(req.params.spotId, "spotId", true);
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  try {
    spotInfo = await spotsData.getSpotById(spotId);
    if (
      !req.session.user ||
      req.session.user._id.toString() !== spotInfo.posterId.toString()
    ) {
      errors.push(`You tried to delete a spot that doesn't belong to you!`);
    }
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  if (errors.length > 0) {
    logger.log(`Invalid session (${req.sessionID}) tried to delete ${spotId}`);
    req.session.authorizationErrors = errors;
    return res.status(401).redirect("/users/login");
  }

  try {
    await spotsData.deleteSpot(spotId, req.session.user._id.toString());
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  if (errors.length > 0) {
    logger.log(`Invalid session (${req.sessionID}) tried to delete ${spotId}`);
    req.session.authorizationErrors = errors;
    return res.status(401).redirect("/users/login");
  } else {
    return res
      .status(200)
      .redirect(`/users/profile/${req.session.user.username}`);
  }
});

router.route("/deleteComment/:commentId").delete(async (req, res) => {
  let errors = [];
  let commentId;
  let commentInfo;
  try {
    commentId = validation.validateString(
      req.params.commentId,
      "commentId",
      true
    );
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  try {
    commentInfo = await spotsData.getCommentById(commentId);
    if (
      !req.session.user ||
      req.session.user._id.toString() !== commentInfo.posterId.toString()
    ) {
      errors.push(`You tried to delete a comment that doesn't belong to you!`);
    }
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  if (errors.length > 0) {
    logger.log(
      `Invalid session (${req.sessionID}) tried to delete ${commentId}`
    );
    req.session.authorizationErrors = errors;
    return res.status(401).redirect("/users/login");
  }

  try {
    await spotsData.deleteComment(commentId, req.session.user._id.toString());
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  if (errors.length > 0) {
    logger.log(
      `Invalid session (${req.sessionID}) tried to delete ${commentId}`
    );
    req.session.authorizationErrors = errors;
    return res.status(401).redirect("/users/login");
  } else {
    return res
      .status(200)
      .redirect(`/users/profile/${req.session.user.username}`);
  }
});

router.route("/deleteRating/:ratingId").delete(async (req, res) => {
  let errors = [];
  let ratingId;
  let ratingInfo;
  try {
    ratingId = validation.validateString(req.params.ratingId, "ratingId", true);
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  try {
    ratingInfo = await spotsData.getRatingById(ratingId);
    if (
      !req.session.user ||
      req.session.user._id.toString() !== ratingInfo.posterId.toString()
    ) {
      errors.push(`You tried to delete a rating that doesn't belong to you!`);
    }
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  if (errors.length > 0) {
    logger.log(
      `Invalid session (${req.sessionID}) tried to delete ${ratingId}`
    );
    req.session.authorizationErrors = errors;
    return res.status(401).redirect("/users/login");
  }

  try {
    await spotsData.deleteRating(ratingId, req.session.user._id.toString());
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  if (errors.length > 0) {
    logger.log(
      `Invalid session (${req.sessionID}) tried to delete ${ratingId}`
    );
    req.session.authorizationErrors = errors;
    return res.status(401).redirect("/users/login");
  } else {
    return res
      .status(200)
      .redirect(`/users/profile/${req.session.user.username}`);
  }
});

router.route("/removefavorite/:spotId").delete(async (req, res) => {
  let errors = [];
  let spotId;
  let userInfo;
  try {
    spotId = validation.validateString(req.params.spotId, "spotId", true);
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }
  if (!req.session.user) {
    logger.log("User not logged in");
    errors.push("Please login first!");
    res.session.authorizationErrors = errors;
    return res.status(401).redirect("/users/login");
  }
  try {
    userInfo = await userData.getUserProfileById(
      req.session.user._id.toString()
    );
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }
  if (errors.length > 0) {
    res.session.authorizationErrors = errors;
    return res.status(401).redirect("users/login");
  }

  if (userInfo.favoriteSpots.indexOf(spotId) == -1) {
    return res
      .status(200)
      .redirect(`/users/profile/${req.session.user.username}`);
  }

  try {
    await userData.putFavoriteSpot(req.session.user._id.toString(), spotId);
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  if (errors.length > 0) {
    res.session.authorizationErrors = errors;
    return res.status(401).redirect("users/login");
  }

  return res
    .status(200)
    .redirect(`/users/profile/${req.session.user.username}`);
});

router.route("/byDistanceJSON").get(async (req, res) => {
  let errors = [];
  logger.log(req.query);
  let { longitude, latitude, distance } = req.query;
  logger.log("Search by location for", longitude, latitude, distance);
  try {
    distance = parseFloat(distance);
    validation.validateNumber(distance);
    if (distance < 0) {
      thorw`Invalid radius!`;
    }
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  try {
    longitude = parseFloat(longitude);
    latitude = parseFloat(latitude);
    validation.validateCoordinates(longitude, latitude);
  } catch (e) {
    logger.log(e);
    errors = errors.concat(e);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      errors: errors,
    });
  }

  try {
    const spots = await spotsData.getSpotsByDistance(
      distance,
      longitude,
      latitude
    );

    return res.status(200).json({ data: spots });
  } catch (e) {
    logger.log(e);
    return res.status(500).json({
      errors: [e],
    });
  }
});

router.route("/byDistance").get(async (req, res) => {
  return res.status(200).render("spots/searchByDistance", {
    user: req.session.user,
    styles: [
      `<link rel="stylesheet" href="/public/css/distanceSearch.css">`,
      `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet">`,
      `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css">`,
    ],
    apikey: process.env.MAPBOX_API_TOKEN,
  });
});
router
  .route("/updatecomment/:commentId")
  .get(async (req, res) => {
    let errors = [];

    let commentId;
    let commentInfo;
    try {
      commentId = validation.validateString(req.params.commentId, "commentId");
    } catch (e) {
      logger.log(e);
      errors = errors.concat(e);
    }

    try {
      commentInfo = await spotsData.getCommentById(commentId);
      if (
        !req.session.user ||
        req.session.user._id.toString() !== commentInfo.posterId.toString()
      ) {
        errors.push(
          `You tried to update a comment that doesn't belong to you!`
        );
      }
    } catch (e) {
      logger.log(e);
      errors = errors.concat(e);
    }

    if (errors.length > 0) {
      logger.log(
        `Invalid session (${req.sessionID}) tried to modify ${commentId}`
      );
      req.session.authorizationErrors = errors;
      return res.status(401).redirect("/users/login");
    }

    if (commentInfo.reportCount > 20) {
      errors.push(
        "The comment is flagged. Please wait till an Admin reviews it before modifying!"
      );
    }

    if (errors.length > 0) {
      logger.log(
        `Invalid session (${req.sessionID}) tried to modify ${commentId}`
      );
      req.session.authorizationErrors = errors;
      return res.status(401).redirect("/users/login");
    }

    logger.log("Rendering edit comment for :", commentId);
    logger.log(commentInfo);

    const publicComment = {
      _id: commentInfo._id.toString(),
      spotId: commentInfo.spotId,
      posterId: commentInfo.posterId,
      message: commentInfo.message,
      createdAt: commentInfo.createdAt.toString(),
      image: commentInfo.image,
      reportCount: commentInfo.reportCount,
    };

    res.render("spots/updateComment", {
      user: req.session.user,
      styles: [`<link rel="stylesheet" href="/public/css/addSpot.css">`],
      scripts: [
        `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
      ],
      comment: publicComment,
    });
  })
  .post(async (req, res) => {
    let discardImages = req.body.orphanImages;
    let errors = [];

    const comment = {
      message: req.body.message,
    };

    if (req.body.image && req.body.image !== "[]") {
      try {
        comment.image = JSON.parse(req.body.image);
        validation.validateObject(comment.image, "Image Object");
        if (!comment.image.public_id || !comment.image.url) {
          delete comment.image;
          throw "Image Object is missing properties. Try to upload image again.";
        }
      } catch (e) {
        logger.log(e);
        errors = errors.concat(
          "Image Object is missing properties. Try to upload image again."
        );
        return res.status(400).render("spots/updateComment", {
          user: req.session.user,
          styles: [`<link rel="stylesheet" href="/public/css/addSpot.css">`],
          scripts: [
            `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
          ],
          comment: comment,
          errors: errors,
        });
      }
    }

    try {
      comment.message = validation.validateString(comment.message);
    } catch (e) {
      logger.log(e);
      errors = errors.concat(
        "Invalid comment message (message must be non-empty string)!"
      );
      return res.status(400).render("spots/updateComment", {
        user: req.session.user,
        styles: [`<link rel="stylesheet" href="/public/css/addSpot.css">`],
        scripts: [
          `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
        ],
        comment: comment,
        errors: errors,
      });
    }

    logger.log("modified comment: ", comment);

    try {
      await spotsData.updateComment(
        req.body.commentId,
        req.session.user._id.toString(),
        comment.message,
        comment.image
      );
      res.status(200).redirect("/users/profile/" + req.session.user.username);
    } catch (e) {
      logger.log(e);
      errors = ["Updating comment failed. Please try again."];
      return res.status(400).render("spots/updateComment", {
        user: req.session.user,
        styles: [`<link rel="stylesheet" href="/public/css/addSpot.css">`],
        scripts: [
          `<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>`,
        ],
        comment: comment,
        errors: errors,
      });
    }

    // delete orphan images from cloud
    if (discardImages) {
      const spotDiscardedImages = JSON.parse(discardImages);
      for (const public_id of spotDiscardedImages) {
        try {
          cloudinary.uploader.destroy(public_id);
        } catch (e) {
          logger.log(e);
        }
      }
    }
  });
export default router;
