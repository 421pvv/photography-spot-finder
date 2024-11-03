import usersRouter from "./users.js";
const constructorMethod = (app) => {
  app.use("/users", usersRouter);
  app.use("*", (req, res) => {
    res.render("spots/allSpots", {
      user: req.session.user,
    });
  });
};

export default constructorMethod;
