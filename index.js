"use strict";
/* -------------------------------------------------------
    EXPRESS - Personnel API
------------------------------------------------------- */
/*
    $ npm i express dotenv mongoose express-async-errors
    $ npm i cookie-session
    $ npm i jsonwebtoken
*/

const express = require("express");
const app = express();

/* ------------------------------------------------------- */
// Required Modules:

// envVariables to process.env:
require("dotenv").config();
const PORT = process.env?.PORT || 8000;

// asyncErrors to errorHandler:
require("express-async-errors");

/* ------------------------------------------------------- */
// Configrations:

// Connect to DB:
const { dbConnection } = require("./src/configs/dbConnection");
dbConnection();

/* ------------------------------------------------------- *
//* MORGAN LOGGING
/* ------------------------------------------------------- */
//* Documantation
// $ npm i swagger-autogen
//   $ npm i swagger-ui-express 
//npm i redoc-express
//? JSON
app.use('/documents/json', (req, res) => {
    res.sendFile('swagger.json', { root: '.' })
})

//? SWAGGER:
const swaggerUi = require('swagger-ui-express')
const swaggerJson = require('./swagger.json')
app.use('/documents/swagger', swaggerUi.serve, swaggerUi.setup(swaggerJson, { swaggerOptions: { persistAuthorization: true } }))

//? REDOC:
const redoc = require('redoc-express')
app.use('/documents/redoc', redoc({
    title: 'PersonnelAPI',
    specUrl: '/documents/json'
}))

/* ------------------------------------------------------- */
// Middlewares:

// Accept JSON:
app.use(express.json());

// Logging:
// app.use(require("./src/middlewares/logging"));

// SessionsCookies:
app.use(require("cookie-session")({ secret: process.env.SECRET_KEY }));

// res.getModelList():
app.use(require("./src/middlewares/findSearchSortPage"));

/* ------------------------------------------------------- *
// Authentication (SessionCookies):
// Login/Logout Control Middleware
app.use(async (req, res, next) => {

    const Personnel = require('./src/models/personnel.model')

    req.isLogin = false

    if (req.session?.id) {

        const user = await Personnel.findOne({ _id: req.session.id })

        // if (user && user.password == req.session.password) {
        //     req.isLogin = true
        // }
        req.isLogin = user && user.password == req.session.password
    }
    console.log('isLogin: ', req.isLogin)

    next()
})

/* ------------------------------------------------------- */
// Authentication (Simpe Token):

app.use(require("./src/middlewares/authentication"));

/* ------------------------------------------------------- */
// Routes:

// HomePath:
app.all("/", (req, res) => {
  res.send({
    error: false,
    message: "Welcome to PERSONNEL API",
    // session: req.session,
    // isLogin: req.isLogin,
    user: req.user,
    api: {
      documents: {
        swagger: "http://127.0.0.1:8000/documents/swagger",
        redoc: "http://127.0.0.1:8000/documents/redoc",
        json: "http://127.0.0.1:8000/documents/json",
      },
      contact: "contact@clarusway.com",
    },
  });
});

// // /departments
// app.use('/departments', require('./src/routes/department.router'))
// // /personnels
// app.use('/personnels', require('./src/routes/personnel.router'))

// app.use(require('./src/routes/index'))
app.use(require("./src/routes/"));

/* ------------------------------------------------------- */

// errorHandler:
app.use(require("./src/middlewares/errorHandler"));

// RUN SERVER:
app.listen(PORT, () => console.log("http://127.0.0.1:" + PORT));

/* ------------------------------------------------------- */
// Syncronization (must be in commentLine):
// require('./src/helpers/sync')()no
