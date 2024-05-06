import { useMemo, useState } from 'react';
import { socket } from './socket.tsx';
import { useParams } from 'react-router-dom';

export function usePeerConnection(localStream: MediaStream) {
    const { roomName } = useParams();
    const [guestStream, setGuestStream] = useState<MediaStream | null>(null);

    const peerConnection = useMemo(() => {
        const connection = new RTCPeerConnection({
            iceServers: [{
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            }],
        });
        // console.log('connection', connection);

        connection.addEventListener('icecandidate', ({ candidate }) => {
            ///
            // console.log('ICE candidate:', candidate);
            ///
            socket.emit('send_candidate', { candidate, roomName });
        });

        connection.addEventListener('track', ({ streams }) => {
            ///
            console.log('Track added:', streams[0]);
            ///
            setGuestStream(streams[0]);
        });



        localStream
            .getTracks()
            .forEach((track) => {
                connection.addTrack(track, localStream);
            });

        return connection;
    }, [localStream, roomName]);

    return {
        peerConnection,
        guestStream,
    };
}