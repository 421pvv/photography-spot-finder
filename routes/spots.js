import { spotsData } from "../data/index.js";
import express from "express";
import validation from "../validation.js";
import logger from "../log.js";
import cloudinary from "../cloudinary/cloudinary.js";
import { MongoCryptKMSRequestNetworkTimeoutError } from "mongodb";
import { spots } from "../config/mongoCollections.js";
const router = express.Router();

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
      await spotsData.createSpot(
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
      return res.status(200);
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


router.route("/search").get(async (req, res) => {
 
    const keyword = req.query.keyword?.trim() || undefined;
    let { tags, minRating, fromDate, toDate } = req.query;
    let filter = {}
    let errors = []
  
      if (tags) {
        //spots = await spotsData.getSpotsByTags(tags.split(','));
        tags = tags.split(',');
        for (const tagI in tags) {
          let tag = tags[tagI];
          tags[tagI] = validation.validateString(tag, "tag");
        }

        filter.tag = tags;
      }
  
      if (minRating) {
        validation.validateNumber(minRating);
        if (minRating > 10 || minRating < 1) {
          errors.push('Min Rating must be between 1 and 10 (inclusive)')
        }
        filter.minRating = minRating;

      }
  
      if (fromDate) {
        validation.validateString(fromDate);
        try {
          fromDate = new Date(fromDate);
        } catch(e) {
          errors.push("From date is invalid")
        }

        if (isNaN(fromDate) ) {
          errors.push("From date is invalid")
        }
        else if (fromDate < new Date(2024, 10, 1)) {
          errors.push('From date must be after or on November 1, 2024')
        }

        filter.fromDate = fromDate;
      }

      if (toDate) {
        validation.validateString(toDate);
        try {
          toDate = new Date(toDate);
        } catch(e) {
          errors.push("To date is invalid")
        }

        if (isNaN(toDate) ) {
          errors.push("To date is invalid")
        }
        else if (toDate > new Date()) {
          errors.push('To date cannot be after current time')
        }

        filter.toDate = toDate;
      }

      if (errors.length > 0) {
        res.render("spots/allSpots", {
          spots: spots,
          user: req.session.user,
          keyword: keyword,
          errors
        });
      }

      const spots = await spotsData.getAllSpots(keyword, filter);
    res.render("spots/allSpots", {
      spots: spots,
      user: req.session.user,
      keyword: keyword, 
    });
  } 
);


export default router;
