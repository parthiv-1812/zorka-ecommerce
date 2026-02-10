const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB is Connected 🥳"))
    .catch((error) =>
        console.log("Error in Connecting MongoDB 🥲 :", error.message)
    );
