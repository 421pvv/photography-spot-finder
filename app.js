import express from "express";
const app = express();
import configRoutes from "./routes/index.js";
import secrets from "./secrets_config.js";
import session from "express-session";
import exphbs from "express-handlebars";
import logging from "./log.js";

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};

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

app.get("/users/profile", (req, res, next) => {
  console.log(req.session.user);
  if (!req.session.user) {
    req.body.authErrors = [
      "You're not logged in! Please login in (or signup) before attempting to accessing profile.",
    ];
    req.url = "/users/login";
    next();
  } else {
    next();
  }
});

app.use("/login", (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/users/profile");
  } else {
    req.method = "POST";
    next();
  }
});
configRoutes(app);

app.listen(3000, () => {
  console.log("Server runing on port 3000");
});
