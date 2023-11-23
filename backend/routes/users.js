const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const secretKey = process.env.secretKey;

//register
router.post("/register", async (req, res) => {
    try {
        //generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //create new user
        const newUser = User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        //save user and send response
        const user = await newUser.save();

        const token = jwt.sign({username : req.body.username},secretKey, { expiresIn: '1h' });
        res.status(200).json({_id: user._id,token});

    } catch (err) {
        res.status(500).json(err);
    }
});

//login

router.post("/login", async (req, res) => {
    try {
        //find user
        const user = await User.findOne({ username: req.body.username });
        if(!user)
            return res.status(400).json("Incorrect Credentials");

        //validate password
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if(!validPassword)
            return res.status(400).json("Incorrect Credentials");

        const token = jwt.sign({username : req.body.username},secretKey, { expiresIn: '1h' });

        //send response
        res.status(200).json({ _id: user._id, username: user.username, token });

    } catch(err) {
        res.status(500).json(err);
    }
});

module.exports = router;
