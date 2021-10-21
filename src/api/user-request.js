const {Router} = require('express');

const User = require('../persistence/users');
const UserRequest = require('../persistence/user-requests');

const sessionMiddleware = require('../middleware/session-middleware');

const router = new Router();

router.get('/', sessionMiddleware, async (request, response) => {
  try {
    const userRequests = await UserRequest.all();
    if (!userRequests) {
      return response.status(400).json({message: 'No data found.'});
    }

    return response.status(200).json(userRequests);
  } catch (error) {
    console.error(`Error: ${error.stack}`);
    response.status(500).json();
  }
});

router.get('/:id', sessionMiddleware, async (request, response) => {
  try {
    const {id} = request.params;
    const userRequest = await UserRequest.findById(id);
    if (!userRequest) {
      return response.status(400).json({message: 'No data found.'});
    }

    return response.status(200).json(userRequest);
  } catch (error) {
    console.error(`Error: ${error.stack}`);
    response.status(500).json();
  }
});

router.get('/user/:username', sessionMiddleware, async (request, response) => {
  try {
    const {username} = request.params;

    const user = await User.find(username);
    const userRequest = await UserRequest.find(user.id);
    if (!userRequest) {
      return response.status(400).json({message: 'No data found.'});
    }

    return response.status(200).json(userRequest);
  } catch (error) {
    console.error(`Error: ${error.stack}`);
    response.status(500).json();
  }
});

router.post('/', sessionMiddleware, async (request, response) => {
  try {
    const {deliveryAddress, contactNumber, contactPerson} = request.body;
    if (!deliveryAddress || !contactNumber || !contactPerson) {
      return response
        .status(400)
        .json({message: 'All fields must be provided'});
    }

    const userRequest = await UserRequest.create(request.userId, {
      deliveryAddress,
      contactNumber,
      contactPerson
    });
    if (!userRequest) {
      return response.status(400).json({message: 'Error when creating user request.'});
    }

    return response.status(200).json(userRequest);
  } catch (error) {
    console.error(`Error: ${error.stack}`);
    response.status(500).json();
  }
});

router.patch('/:id', sessionMiddleware, async (request, response) => {
  try {
    const {id} = request.params;
    const {status} = request.body;
    const statuses = ['created', 'accepted', 'rejected'];
    if (!status) {
      return response
        .status(400)
        .json({message: 'All fields must be provided'});
    }

    if (!statuses.includes(status)) {
      return response
        .status(400)
        .json({message: `Status must be one of: ${statuses}`});
    }

    const userRequest = await UserRequest.updateStatus(id, status);
    if (!userRequest) {
      return response.status(400).json({message: 'Error when updating user request.'});
    }

    return response.status(200).json(userRequest);
  } catch (error) {
    console.error(`Error: ${error.stack}`);
    response.status(500).json();
  }
});

module.exports = router;
