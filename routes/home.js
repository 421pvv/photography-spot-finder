import { contestData, spotsData } from "../data/index.js";
import express from "express";
import validation from "../validation.js";
import logger from "../log.js";
const router = express.Router();

router.route("/home").get(async (req, res) => {
  const errors = req.session.authorizationErrors;
  delete req.session.authorizationErrors;

  let topSpots;
  try {
    topSpots = await spotsData.getLastMonthTopSpots();
  } catch (e) {
    topSpots = [];
  }

  let contestWinners;
  try {
    contestWinners = await contestData.getContestWinners();
  } catch (e) {
    contestWinners = [];
  }
  logger.log("Conest winners fetched:");
  logger.log(contestWinners);
  return res.status(200).render("home", {
    user: req.session.user,
    styles: [`<link rel="stylesheet" href="/public/css/homePage.css">`],
    authErrors: errors,
    spots: topSpots,
    contestWinners,
  });
});

export default router;
