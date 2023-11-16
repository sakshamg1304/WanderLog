const router = require("express").Router();
const Pin = require("../models/Pin");

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Store the uploaded files in the `uploads/` directory
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate a unique filename for the uploaded file
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage: storage });

//create a pin
router.post("/", upload.array('images'), async (req, res) => {
    try {
        const { username, title, desc, rating, lat, long } = req.body;
        const images = req.files;

        const newPin = new Pin({
            username,
            title,
            desc,
            rating,
            lat,
            long,
            images: images.map(file => file.filename)
        });
        const savedPin = await newPin.save();

        res.status(200).json(savedPin);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// get all pins

router.get("/", async (req, res) => {
    try {
        const pins = await Pin.find();
        res.status(200).json(pins);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;