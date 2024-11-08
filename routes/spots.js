import spotsData from "../data/spots.js";
import express from "express";
import validation from "../validation.js";


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

router
    .route('/searchbytags')
    .get(async (req, res) => {
        try{
            const tagString = req.query.tags
            if(!tagString){
                return res.status(400).json({error: "incorrect input, not provided"})
            }
            
            const tagsArr = tagString.split(',').map(tag => tag.trim()).filter(Boolean)
            if(tagsArr.length === 0){
                return res.status(400).json({error: "tags array is empty"})
            }

            const spotList = await spotsData.getSpotsByTags(tagsArr)
            // if(spotList.lenghth == 0){
            //     return res.status(404).json({ message: "No spots found" });
            // }
            res.json(spotList)
        }catch(e){
            res.status(500).json({error: e})
        }
    })
    
router
    .route('/searchbyrating')
    .get(async (req, res) => {
        try{
            const minRating = parseFloat(req.query.minRating)
        const maxRating = parseFloat(req.query.maxRating)

        if(isNaN(minRating) || isNaN(maxRating)){
            return res.status(400).json({error: "invalid min and max rating values prvided"})

        }
        const spotList = await spotsData.getSpotsByRating(minRating, maxRating)
        res.json(spotList)

        }catch(e){
            res.status(400).json({error: "Invalid rating values provided"})
        }
        
    })

  export default router;