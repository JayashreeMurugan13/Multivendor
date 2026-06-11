import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, { withCredentials: true });
  }
  return socket;
};

export const joinRoom = (userId: string, role: string) => {
  getSocket().emit('join', { userId, role });
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};
