import io from 'socket.io-client';

const SIGNALING_SERVER_URL = import.meta.env.VITE_SIGNALING_SERVER_URL;

export const socket = io(SIGNALING_SERVER_URL, {
    autoConnect: false,
});

// export const socket = io(SIGNALING_SERVER_URL);