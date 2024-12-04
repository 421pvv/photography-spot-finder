import express from "express";
import { contestData, spotsData } from "../data/index.js";
import validation from "../validation.js";
import logger from "../log.js";
import cloudinary from "../cloudinary/cloudinary.js";
import { MongoCryptKMSRequestNetworkTimeoutError } from "mongodb";
import { contestRatings, spots } from "../config/mongoCollections.js";
import log from "../log.js";
const router = express.Router();


const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  res.status(403).render("error", { message: "Access denied. Admins only!" });
};

router.get("/", isAdmin, async (req, res) => {
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
    reportedComments = await spotsData.getReportedComments(req.session.user._id);
  } catch (e) {
    errors.push("Unable to get reported comments.");
  }

  try {
    reportedContenstSpots = await contestData.getReportedContestSubmissions(req.session.user._id);
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



router.post("/clearSpotReports", isAdmin, async (req, res) => {
    const { spotId } = req.body;
    try{
      await spotsData.clearSpotReports(spotId, req.session.user._id);

      res.redirect("/admin")
    } catch (e) {
      req.session.errorMessage = e[0] || "Failed to clear spot reports.";
      res.redirect("/admin");
    }

});

router.post("/deleteReportedSpot", isAdmin, async (req, res) => {
  let errors = [];
  let reportedSpots = [];
  let reportedComments = [];
  let reportedContenstSpots = [];
    const { spotId } = req.body;
    await spotsData.deleteReportedSpot(spotId, req.session.user._id);

    try {
      reportedSpots = await spotsData.getReportedSpots(req.session.user._id);
    } catch (e) {
      errors.push("Unable to fetch updated reported spots.");
    }

    try {
      reportedComments = await spotsData.getReportedComments(req.session.user._id);
    } catch (e) {
      errors.push("Unable to fetch updated reported comments.");
    }

    try {
      reportedContenstSpots = await contestData.getReportedContestSubmissions(req.session.user._id);
    } catch (e) {
      errors.push("Unable to fetch updated contest spots.");
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


export default router;
