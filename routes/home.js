import { spotsData } from "../data/index.js";
import express from "express";
import validation from "../validation.js";

const router = express.Router();

router.route("/home").get(async (req, res) => {
  return res.status(200).render("home");
});

export default router;
