const express = require("express");
const {
  userRouter,
  countriesRouter,
  universityRouter,
  countryRouter,
} = require("./api/user.routes");
const { twoFA_Router } = require("./api/2FA");
const socketRouter = require("./api/socket.routes");

// define routes
module.exports = function routes(app) {
  app.use(express.json());
  app.use("/api/student", userRouter);
  app.use("/api/students", userRouter);
  app.use("/api/student", twoFA_Router);
  app.use("/api/lecturer", userRouter);
  app.use("/api/countries", countriesRouter);
  app.use("/api/countries", countryRouter);
  app.use("/api/universities", universityRouter);
  app.use("/api", twoFA_Router);
  app.use("/api/socket", socketRouter); // Add socket test routes
};
