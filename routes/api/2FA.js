const express = require('express');
const { setup2FA, verify2FA } = require('../../controllers/2FA');
const {Router} = express

const twoFA_Router = Router()

twoFA_Router.post("/setup-2FA", setup2FA);
twoFA_Router.post("/verify-2FA", verify2FA)


module.exports = {
    twoFA_Router
}