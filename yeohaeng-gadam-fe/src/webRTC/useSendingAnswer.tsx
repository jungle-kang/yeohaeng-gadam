import { useCallback } from 'react';
import { socket } from './socket.tsx';
import { useParams } from 'react-router-dom';

export function useSendingAnswer(peerConnection: RTCPeerConnection) {
    const roomName = 'test'; // 룸네임 임시로 고정

    const handleConnectionOffer = useCallback(
        async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
            console.log('Received offer:', offer);

            try {
                peerConnection.setRemoteDescription(offer);
                console.log('Set remote description successfully.');

                const answer = await peerConnection.createAnswer(offer);
                console.log('Created answer:', answer);

                peerConnection.setLocalDescription(answer);
                console.log('Set local description successfully.');

                socket.emit('answer', answer, roomName);
                console.log('Answer sent:', answer, roomName);
            } catch (error) {
                console.error('Error handling connection offer:', error);
            }
        },
        [roomName],
    );

    return {
        handleConnectionOffer,
    };
}
