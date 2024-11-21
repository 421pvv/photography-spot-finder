import usersRouter from "./users.js";
import spotsRouter from "./spots.js";
import { spotsData } from "../data/index.js";

const constructorMethod = (app) => {
  app.use("/users", usersRouter);
  app.use("/spots", spotsRouter);

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
