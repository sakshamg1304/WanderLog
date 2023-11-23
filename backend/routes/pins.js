const router = require("express").Router();
const Pin = require("../models/Pin");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.secretKey;


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

const authenticateJwt = (req,res,next) => {
    const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};


//create a pin
router.post("/", authenticateJwt, upload.array('images',5), async (req, res) => {
    try {
        const username  = req.user.username;
        const {title, desc, rating, lat, long } = req.body;
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

router.get("/", authenticateJwt , async (req, res) => {
    try {
        const pins = await Pin.find({username: req.user.username});
        res.status(200).json(pins);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;