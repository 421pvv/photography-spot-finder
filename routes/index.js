import usersRouter from "./users.js";
import spotsRouter from "./spots.js";
import spotsData from "../data/spots.js";

const constructorMethod = (app) => {
  app.use("/users", usersRouter);
  app.use("/spots" , spotsRouter)


  app.use("*", async(req, res) => {
    const allSpots = await spotsData.getAllSpots()
    res.render("spots/allSpots", {
      spots: allSpots,
      user: req.session.user,
    });
  });
};

export default constructorMethod;
