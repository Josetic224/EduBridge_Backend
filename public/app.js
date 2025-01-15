require("module-alias/register");
require("reflect-metadata");

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const cors = require("cors");
const db = require("../configs/dbConfig");
const {AppError} = require("../helpers/error");
const { logger, expressPinoLogger } = require("../utils/logger.util");


//App Init
const app = express();

//middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressPinoLogger({ logger }));

//App Home Route
app.get("/", (req, res) => {
  res.send("Welcome to Edubridge Backend");
});
//Register Routes
require("../routes/index.routes")(app);

//calling the db connection
db();


app.use((error, req, res, next) => {
    error.status = error.status || "error";
    error.statusCode = error.statusCode || 500;
  
    res.status(error.statusCode).json({
      errors: [
        {
          error: error.message,
        },
      ],
    });
  });
  

  // const PORT = process.env.PORT || 7001;
  // app.listen(PORT, () => {
  //   console.log(`Server is running on port ${PORT}`);
  // });


  module.exports = app;
  