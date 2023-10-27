const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const pinRoute = require("./routes/pins");
const userRoute = require("./routes/users");
const cors = require("cors");
const PORT = process.env.PORT || 8800;
dotenv.config();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected")
    })
    .catch((err) => console.log(err));

app.use("/api/users", userRoute);
app.use("/api/pins", pinRoute);

app.listen(PORT, () => {
    console.log("Server is Running !!");
})