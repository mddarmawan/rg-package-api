const {Router} = require('express');
const User = require('../persistence/users');

const sessionMiddleware = require('../middleware/session-middleware');

const router = new Router();

router.get('/:id', sessionMiddleware, async (request, response) => {
  try {
    const {id} = request.params;
    const user = await User.findById(id);
    if (!user) {
      return response.status(400).json({message: 'No data found.'});
    }

    return response.status(200).json(user);
  } catch (error) {
    console.error(`Error: ${error.stack}`);
    response.status(500).json();
  }
});

router.post('/', async (request, response) => {
  try {
    const {username, password} = request.body;
    if (!username || !password) {
      return response
        .status(400)
        .json({message: 'username and password must be provided'});
    }

    const user = await User.create(username, password);
    if (!user) {
      return response.status(400).json({message: 'User already exists'});
    }

    return response.status(200).json(user);
  } catch (error) {
    console.error(
      `createUser({ username: ${request.body.username} }) >> Error: ${error.stack}`
    );
    response.status(500).json();
  }
});

module.exports = router;
