const Session = require('../persistence/sessions');

const sessionMiddleware = async (request, response, next) => {
  if (!request.session.id && !request.headers.session_id) {
    return response.sendStatus(401);
  }

  try {
    const session = await Session.find(request.session.id);
    const sessionByHeader = await Session.find(request.headers.session_id);
    if (!session && !sessionByHeader) {
      request.session.id = null;
      return response.sendStatus(401);
    }

    if (session) {
      request.userId = session.userId;
    } else {
      request.userId = sessionByHeader.userId;
    }

    next();
  } catch (error) {
    console.error(
      `SessionMiddleware(${request.session.id}) >> Error: ${error.stack}`
    );
    return response.sendStatus(500);
  }
};

module.exports = sessionMiddleware;
