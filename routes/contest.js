import { spotsData, userData } from "../data/index.js";
import express from "express";
import validation from "../validation.js";
import logger from "../log.js";
import cloudinary from "../cloudinary/cloudinary.js";
import { MongoCryptKMSRequestNetworkTimeoutError } from "mongodb";
import { contestRatings, spots } from "../config/mongoCollections.js";
import log from "../log.js";
const router = express.Router();

//TODO remove imports
import { contestSpots } from "../config/mongoCollections.js";

router.route("/").get(async (req, res) => {
  let errors = [];

  // TODO replace with data func
  let contestSpotsData;
  try {
    contestSpotsData = await (await contestSpots()).find({}).toArray();
  } catch (e) {
    errors.push("Failed to fetch contest spots. Please try again later.");
  }
  logger.log("Contest spots: ", contestSpotsData);

  const props = {
    spots: contestSpotsData,
    errors,
    styles: [`<link rel="stylesheet" href="/public/css/allSpots.css">`],
  };

  res.render("contestSpots/allSpots", props);
});

export default router;
