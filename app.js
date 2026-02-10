require("dotenv").config()
const express = require("express")
const http = require("http")
const cors = require("cors")
const app = express()
const server = http.createServer(app)

require("./config/db") // connecting db
const zorka = require("./routing") // for API routing

const corsOptions = {
    origin: "*",
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/files",express.static("upload"))  // for image upload
app.use("/api/v1",zorka)

app.use((req,res)=>{
    res.status(404).json({
        message : "Route not Found 🥲"
    })
})

const port = process.env.PORT;
server.listen(port, ()=>{
    console.log(`Server is Running on http://localhost:${port}`);
})