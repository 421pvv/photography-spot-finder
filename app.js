import express from "express";
const app = express();
import configRoutes from "./routes/index.js";
import secrets from "./config/secrets.js";
import session from "express-session";
import exphbs from "express-handlebars";
import logging from "./log.js";
import logger from "./log.js";
import log from "./log.js";
import dotenv from "dotenv";

dotenv.config();

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};
app.use("/public", express.static("public"));
app.use("/validation.js", express.static("public"));

app.use(express.json());
app.use(
  session({
    name: "Photography_Spot_Finder",
    secret: secrets.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 3600000 }, // session expires after one hour
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use("*", (req, res, next) => {
  const restrictedPaths = [
    { url: "users/profile", error: "access profile!" },
    { url: "spots/new", error: "add a new spot!" },
    { url: "spots/edit", error: "modify a spot!" },
    { url: "spots/addComment", error: "add comment to a spot!" },
    { url: "spots/putRating", error: "rate a spot!" },
  ];
  let curPath = req.baseUrl + req.path;
  const restrictedPath = restrictedPaths.filter((path) =>
    curPath.includes(path.url)
  );

  if (restrictedPath.length > 0 && !req.session.user) {
    logger.log(`Invalid session (${req.sessionID}) tried to access ${curPath}`);
    req.session.authErrors = [
      `You're not logged in! Please login in (or signup) before attempting to ${restrictedPath[0].error}`,
    ];
    return res.redirect("/users/login");
  } else {
    next();
  }
});

app.post("/spots/edit/:spotId", (req, res, next) => {
  req.method = "PUT";
  next();
});

app.use("/spots/putRating/:spotId", (req, res, next) => {
  logger.log("Attempting add rating to spot", req.params.spotId);
  req.method = "PUT";
  next();
});

app.use("/users/login", (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/users/profile");
  } else {
    next();
  }
});

app.use("/users/signup", (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/users/profile");
  } else {
    next();
  }
});
configRoutes(app);

app.listen(3000, () => {
  console.log("Application runing on port 3000");
  console.log("URL: http://localhost:3000/");
});
