const {Router} = require('express');
const bcrypt = require('bcrypt');

const User = require('../persistence/users');
const Session = require('../persistence/sessions');

const sessionMiddleware = require('../middleware/session-middleware');

const router = new Router();

router.post('/', async (request, response) => {
  try {
    const {username, password} = request.body;
    const user = await User.findWithPassword(username);
    if (!user || !(await bcrypt.compare(String(password), user.password))) {
      return response.sendStatus(403);
    }

    const sessionId = await Session.create(user.id);
    request.session.id = sessionId;
    response.status(201).json({
      sessionId,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error(
      `POST session ({ username: ${request.body.username} }) >> ${error.stack})`
    );
    response.status(500).json();
  }
});

router.get('/', sessionMiddleware, (request, response) => {
  response.json({userId: request.userId});
});

router.delete('/', async (request, response) => {
  try {
    if (request.headers.session_id) {
      await Session.delete(request.headers.session_id);
    }

    request.session.id = null;
    response.status(200).json();
  } catch (error) {
    console.error(`DELETE session >> ${error.stack}`);
    response.status(500).json();
  }
});

module.exports = router;
