const { Server } = require('socket.io');
const config = require('./env');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed =
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin) ||
          origin === config.clientUrl;
        if (isAllowed || config.nodeEnv === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    // User room subscription
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Execution room subscription
    socket.on('join_execution', (executionId) => {
      if (executionId) {
        socket.join(`execution_${executionId}`);
      }
    });

    socket.on('leave_execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution_${executionId}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

function getIO() {
  return io;
}

function emitExecutionEvent(executionId, eventData) {
  if (io && executionId) {
    io.to(`execution_${executionId}`).emit('agent_event', eventData);
    io.emit('global_execution_update', {
      executionId,
      ...eventData,
    });
  }
}

function emitGlobalEvent(eventData) {
  if (io) {
    io.emit('global_execution_update', eventData);
  }
}

function emitNotification(userId, notificationData) {
  if (io) {
    if (userId) {
      io.to(`user_${userId}`).emit('notification', notificationData);
    }
    io.emit('global_notification', notificationData);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitExecutionEvent,
  emitGlobalEvent,
  emitNotification,
};
