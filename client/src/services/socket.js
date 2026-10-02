import { io } from 'socket.io-client';

const getSocketURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${hostname}:5000`;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
};

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    socket = io(getSocketURL(), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      const storedUser = localStorage.getItem('agentflow_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.id || user._id) {
            socket.emit('join_user', user.id || user._id);
          }
        } catch (_) {}
      }
    });
  }

  return socket;
};

export const joinExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('join_execution', executionId);
  }
};

export const leaveExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('leave_execution', executionId);
  }
};
