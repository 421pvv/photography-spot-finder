import spotsData from "../data/spots.js";
import express from "express";
import validation from "../validation.js";
import logger from "../log.js"
import cloudinary from "../cloudinary/cloudinary.js";
import { MongoCryptKMSRequestNetworkTimeoutError } from "mongodb";
const router = express.Router();

router
    .route('/new')
    .get(async (req, res) => {
        res.render('spots/addSpot', {
            user: req.session.user,
            styles: [
                `<link rel="stylesheet" href="/public/css/addSpot.css">`,
                `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />`,
                `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css"/>`
            ],
            scripts: [
                `<script id="search-js" defer src="https://api.mapbox.com/search-js/v1.0.0-beta.21/web.js"></script>`,
                `<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>`,
                `<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.min.js"></script>`
            ],
            apikey: process.env.MAPBOX_API_TOKEN,
        });
    })
    .post(async (req, res) => {
        const newSpot = {
            spotName: req.body.spotName,
            spotDescription : req.body.spotDescription,
            spotAccessibility: req.body.spotAccessibility,
            spotBestTimes: req.body.spotBestTimes,
            spotTags: req.body.spotTags,
            spotImages: req.body.spotImages,
            spotLongitude: req.body.spotLongitude,
            spotAddress: req.body.spotAddress,
            spotLatitude: req.body.spotLatitude,
            geometrySave: req.body.geometrySave,
        };
        const errors = {}

        logger.log(newSpot);
        try {
            newSpot.spotName = validation.validateString(newSpot.spotName);
        } catch (e) {
            errors.error_spotName = [`Spot Name must not be blank or just spaces!`];
        }

        try {
            newSpot.spotDescription = validation.validateString(newSpot.spotDescription);
        } catch (e) {
            errors.error_spotDescription = [`Spot Description must not be blank or just spaces!`];
        }

        try {
            newSpot.spotAccessibility = validation.validateString(newSpot.spotAccessibility);
        } catch (e) {
            errors.error_spotAccessibility = [`Spot Accessibility  must not be blank or just spaces!`];
        }


        let bestTimes = newSpot.spotBestTimes.split(",");
        
        if (bestTimes.length == 0) {
            errors.error_spotBestTimes = 'Must provide at least one tag for spot';
        }
        let tagErrors = [];
        for (const tagI in bestTimes) {
            try {
                bestTimes[tagI] = validation.validateString(bestTimes[tagI]);
            } catch (e) {
                tagErrors.push(`Invalid best time: "${bestTimes[tagI]}". A best time cannot be blank or just spaces.`)
            }
        }
        if (tagErrors.length > 0) {
            errors.error_spotBestTimes = tagErrors;
        } else {
            newSpot.spotBestTimes = bestTimes;
        }

        const tags = newSpot.spotTags.split(",");
        tagErrors = [];
        for (const tagI in tags) {
            try {
                tags[tagI] = validation.validateString(tags[tagI]);
            } catch (e) {
                tagErrors.push(`Invalid tag: "${tags[tagI]}". A tag cannot be blank or just spaces.`)
            }
        }
        if (tagErrors.length > 0) {
            errors.error_spotTags = tagErrors;
        } else {
            newSpot.spotTags = tags;
        }

        try {
            validation.validateCoordinates(newSpot.spotLongitude, newSpot.spotLatitude);
            newSpot.spotLatitude = parseFloat(newSpot.spotLatitude);
            newSpot.spotLongitude = parseFloat(newSpot.spotLongitude);
            newSpot.spotAddress = validation.validateString(newSpot.spotAddress);
        } catch (e) {
            logger.log('error', e)
            errors.error_spotLocation = [`Please use the map above to select the location!`];
        }


        try {
            newSpot.spotImages = JSON.parse(newSpot.spotImages)
        } catch(e) {
            errors.error_spotImages= [`Please upload at least one image of the spot!`];

        }

        try {
            newSpot.geometrySave = JSON.stringify(JSON.parse(newSpot.geometrySave));
        } catch(e) {

        }


        if (Object.keys(errors).length > 0) {
            if (!errors.error_spotImages) {
                for (const image of newSpot.spotImages) {
                    try {
                    await cloudinary.uploader.destroy(image.public_id);
                    } catch(e) {

                    }
                }
            }
            if (!errors.error_spotImages) {
                errors.error_spotImages = [`Please re-upload your images.`];
            }
            logger.log(errors)

            return res.status(400).render('spots/addSpot', {
                user: req.session.user,
                styles: [
                    `<link rel="stylesheet" href="/public/css/addSpot.css">`,
                    `<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />`,
                    `<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.css" type="text/css"/>`
                ],
                scripts: [
                    `<script id="search-js" defer src="https://api.mapbox.com/search-js/v1.0.0-beta.21/web.js"></script>`,
                    `<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>`,
                    `<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1-dev/mapbox-gl-geocoder.min.js"></script>`
                ],
                apikey: process.env.MAPBOX_API_TOKEN,
                errors,
                spot: newSpot
            });
        }
        const spot = {
            name: newSpot.name,
            location: {
                type: "Point",
                coordinates: [newSpot.spotLongitude, newSpot.spotLatitude]
            },
            address: newSpot.spotAddress,
            description: newSpot.spotDescription,
            accessibility: newSpot.spotAccessibility,
            bestTimes: newSpot.spotBestTimes,
            images: newSpot.spotImages,
            tags: newSpot.spotTags,
            createdAt: new Date(),
        }
        logger.log(spot);
        return res.status(200)
    })

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

  export default router;