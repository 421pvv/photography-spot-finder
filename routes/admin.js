import express from "express";
import { contestData, spotsData } from "../data/index.js";
import validation from "../validation.js";
import logger from "../log.js";
import cloudinary from "../cloudinary/cloudinary.js";
import { MongoCryptKMSRequestNetworkTimeoutError } from "mongodb";
import { contestRatings, spots } from "../config/mongoCollections.js";
import log from "../log.js";
const router = express.Router();

// const isAdmin = (req, res, next) => {
//   if (req.session.user && req.session.user.role === "admin") {
//     return next();
//   }
//   res.status(403).render("error", { message: "Access denied. Admins only!" });
// };

router.get("/", async (req, res) => {
  let errors = [];
  let reportedSpots = [];
  let reportedComments = [];
  let reportedContenstSpots = [];

  try {
    reportedSpots = await spotsData.getReportedSpots(req.session.user._id);
  } catch (e) {
    errors.push("Unable to get reported spots.");
  }

  try {
    reportedComments = await spotsData.getReportedComments(
      req.session.user._id
    );
  } catch (e) {
    errors.push("Unable to get reported comments.");
  }

  try {
    reportedContenstSpots = await contestData.getReportedContestSubmissions(
      req.session.user._id
    );
  } catch (e) {
    errors.push("Unable to get reported contest spots.");
  }

  if (errors.length > 0) {
    res.render("admin/adminPanel", {
      user: req.session.user,
      reportedSpots,
      reportedComments,
      reportedContenstSpots,
      errors,
      styles: [`<link rel="stylesheet" href="/public/css/adminPanel.css">`],
    });
  } else {
    res.render("admin/adminPanel", {
      user: req.session.user,
      reportedSpots,
      reportedComments,
      reportedContenstSpots,
      styles: [`<link rel="stylesheet" href="/public/css/adminPanel.css">`],
    });
  }
});

router.post("/clearSpotReports", async (req, res) => {
  const { spotId } = req.body;
  try {
    await spotsData.clearSpotReports(spotId, req.session.user._id);

    res.redirect("/admin");
  } catch (e) {
    req.session.errorMessage = e[0] || "Failed to clear spot reports.";
    res.redirect("/admin");
  }
});

router.post("/deleteReportedSpot", async (req, res) => {
  const { spotId } = req.body;
  try {
    await spotsData.deleteReportedSpot(spotId, req.session.user._id);

    res.redirect("/admin");
  } catch (e) {
    req.session.errorMessage = e[0] || "Failed to clear spot reports.";
    res.redirect("/admin");
  }
});

router.post("/clearReportedComment", async (req, res) => {
  const { spotId } = req.body;
  try {
    await spotsData.clearCommentReports(spotId, req.session.user._id);

    res.redirect("/admin");
  } catch (e) {
    req.session.errorMessage = e[0] || "Failed to clear spot reports.";
    res.redirect("/admin");
  }
});

router.post("/deleteReportedComment", async (req, res) => {
  const { spotId } = req.body;
  try {
    await spotsData.deleteReportedComment(spotId, req.session.user._id);

    res.redirect("/admin");
  } catch (e) {
    req.session.errorMessage = e[0] || "Failed to clear spot reports.";
    res.redirect("/admin");
  }
});

router.post("/clearReportedContestSubmission", async (req, res) => {
  const { spotId } = req.body;
  try {
    await contestData.clearContestSubmissionReports(
      spotId,
      req.session.user._id
    );
    deleteReportedContestSubmission;
    res.redirect("/admin");
  } catch (e) {
    req.session.errorMessage = e[0] || "Failed to clear spot reports.";
    res.redirect("/admin");
  }
});

router.post("/deleteReportedContestSubmission", async (req, res) => {
  const { spotId } = req.body;
  try {
    await contestData.deleteReportedContestSubmission(
      spotId,
      req.session.user._id
    );

    res.redirect("/admin");
  } catch (e) {
    req.session.errorMessage = e[0] || "Failed to clear spot reports.";
    res.redirect("/admin");
  }
});

export default router;
