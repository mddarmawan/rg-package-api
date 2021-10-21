const express = require('express');

const {Router} = express;
const router = new Router();

const user = require('./user');
const session = require('./session');
const userRequest = require('./user-request');

router.use('/api/users', user);
router.use('/api/sessions', session);
router.use('/api/user-requests', userRequest);

module.exports = router;
