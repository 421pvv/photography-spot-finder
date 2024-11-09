import express from "express";
const app = express();
import configRoutes from "./routes/index.js";
import secrets from "./config/secrets.js";
import session from "express-session";
import exphbs from "express-handlebars";
import logging from "./log.js";
import logger from "./log.js";
import log from "./log.js";
import dotenv from 'dotenv';

dotenv.config();

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};
app.use('/public', express.static('public'));
app.use('/validation.js', express.static('public'));

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

app.get("*", (req, res, next) => {
  const restrictedPaths = [
    {url: "/users/profile", error: "access profile!"},
    //{url: "/spots/new", error: "add a new spot!"},
  ];
  let curPath = req.baseUrl + req.path;
  if (curPath.charAt(curPath.length - 1) === '/') {
    curPath = curPath.substring(0, curPath.length - 1);
  }
  const restrictedPath = restrictedPaths.filter(path => path.url === curPath);

  if (restrictedPath.length > 0 && !req.session.user) {
    logger.log(`Invalid session (${req.sessionID}) tried to access ${curPath}`)
    req.body.authErrors = [
      `You're not logged in! Please login in (or signup) before attempting to ${restrictedPath[0].error}`,
    ];
    req.url = "/users/login";
    next();
  } else {
    next();
  }
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
