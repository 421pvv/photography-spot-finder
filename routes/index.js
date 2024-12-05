import usersRouter from "./users.js";
import spotsRouter from "./spots.js";
import adminRouter from "./admin.js";
import contestRouter from "./contest.js";
import homeRouter from "./home.js";
const constructorMethod = (app) => {
  app.use("/", homeRouter);
  app.use("/users", usersRouter);
  app.use("/spots", spotsRouter);
  app.use("/contest", contestRouter);
  app.use("/admin", adminRouter);
  app.use("*", async (req, res) => {
    res.status(404).render("error", {
      message: "404: Route not found",
      user: req.session.user,
    });
  });
};

export default constructorMethod;
