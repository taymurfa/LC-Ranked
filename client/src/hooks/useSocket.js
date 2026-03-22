import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

let socketInstance = null;
let currentToken = null;

export function useSocket() {
    const { token } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        // If token changed (different user or refreshed), reconnect
        if (socketInstance && currentToken !== token) {
            socketInstance.disconnect();
            socketInstance = null;
        }

        if (!socketInstance) {
            currentToken = token;
            socketInstance = io({
                auth: { token },
                transports: ['websocket'],
            });

            socketInstance.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
            });
        }

        socketRef.current = socketInstance;

        return () => {};
    }, [token]);

    return socketRef.current;
}

/** Disconnect and clear the singleton socket (call on sign-out). */
export function disconnectSocket() {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        currentToken = null;
    }
}
