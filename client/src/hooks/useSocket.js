import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

let socketInstance = null;

export function useSocket() {
    const { token } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        if (!socketInstance) {
            socketInstance = io({
                auth: { token },
                transports: ['websocket'],
            });
        }

        socketRef.current = socketInstance;

        return () => {
            // Don't completely disconnect on unmount to allow cross-page socket events
        };
    }, [token]);

    return socketRef.current;
}
