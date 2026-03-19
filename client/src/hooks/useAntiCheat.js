import { useEffect, useState } from 'react';

export function useAntiCheat(socket, matchId) {
    const [tabWarnings, setTabWarnings] = useState(0);
    const [faceOk, setFaceOk] = useState(true);
    const [acAlert, setAcAlert] = useState(null);

    useEffect(() => {
        if (!socket || !matchId) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabWarnings(w => w + 1);
                setAcAlert(`Tab switch detected — warning ${tabWarnings + 1}/3`);
                socket.emit('anticheat:event', { matchId, type: 'tab_blur', details: {} });
            }
        };

        const handlePaste = (e) => {
            const pasteText = (e.clipboardData || window.clipboardData).getData('text');
            if (pasteText.length > 20) {
                setAcAlert('Paste detected — warning');
                socket.emit('anticheat:event', { matchId, type: 'paste_detected', details: { length: pasteText.length } });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("paste", handlePaste);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("paste", handlePaste);
        };
    }, [socket, matchId, tabWarnings]);

    // Handle Server Warnings
    useEffect(() => {
        if (!socket) return;

        socket.on('anticheat:warn', ({ type, count }) => {
            if (type === 'tab_blur') setTabWarnings(count);
        });

        return () => {
            socket.off('anticheat:warn');
        };
    }, [socket]);

    return { tabWarnings, setTabWarnings, faceOk, acAlert, setAcAlert };
}
