import usersRouter from "./users.js";
import spotsRouter from "./spots.js";
import adminRouter from "./admin.js"
import { spotsData } from "../data/index.js";
import contestRouter from "./contest.js";
const constructorMethod = (app) => {
  app.use("/users", usersRouter);
  app.use("/spots", spotsRouter);
  app.use("/contest", contestRouter);
  app.use("/admin" , adminRouter)
  app.use("*", async (req, res) => {
    const allSpots = await spotsData.getAllSpots(undefined, {});
    res.render("spots/allSpots", {
      spots: allSpots,
      styles: [`<link rel="stylesheet" href="/public/css/allSpots.css">`],
      scripts: [
        `<script type="module" src="/public/js/spots/filters.js"></script>`,
      ],
      user: req.session.user,
    });
  });
};

export default constructorMethod;
