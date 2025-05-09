import {v2 as cloudinary} from 'cloudinary';
import logger from "../log.js"
import dotenv from 'dotenv';

dotenv.config();
cloudinary.config({
    cloud_name: 'db7w46lyt',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;