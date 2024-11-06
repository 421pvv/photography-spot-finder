import spotsData from "../data/spots.js";
import express from "express";

const router = express.Router();

router
    .route('/allSpots')
    .get(async (req, res) => {
        try {
        const allSpots = await spotsData.getAllSpots();
        res.render('spots/allSpots', {
            spots: allSpots,
            user: req.session.user
        });
        } catch (error) {
        res.status(500).json({ error: "Could not fetch spots." });
        }
    })

router
    .route('/search')
    .get(async (req , res) => {
        try{
            const keyword = req.query.keyword?.trim() || ''
            let spots 

            if (!keyword) {
                spots = await spotsData.getAllSpots();
            } else {
                spots = await spotsData.getSpotsByKeywordSearch(keyword);
            }
            res.json(spots)
            // res.render('spots/allSpots', {
            //     spots: spots,
            //     user: req.session.user
            // });
        } catch (error) {
            res.status(500).json({ error: "Could not perform search." })
        }
    })

  export default router;