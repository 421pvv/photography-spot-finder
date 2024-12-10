import { spotsData } from "../data/index.js";
import express from "express";
import validation from "../validation.js";

const router = express.Router();

router.route("/home").get(async (req, res) => {
  const errors = req.session.authorizationErrors;
  delete req.session.authorizationErrors;
  return res.status(200).render("home", {
    user: req.session.user,
    styles: [`<link rel="stylesheet" href="/public/css/homePage.css">`],
    authErrors: errors,
  });
});

export default router;
