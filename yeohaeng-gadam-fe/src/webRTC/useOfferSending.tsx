import { useCallback } from 'react';
import { socket } from './socket.tsx';
import { useParams } from 'react-router-dom';

export function useOfferSending(peerConnection: RTCPeerConnection) {
    const { roomName } = useParams();

    const sendOffer = useCallback(async () => {
        try {
            const offer = await peerConnection.createOffer();
            console.log('Offer 생성됨:', offer);

            peerConnection.setLocalDescription(offer);
            console.log('Local Description 설정 완료');

            socket.emit('send_connection_offer', offer, roomName);
            console.log('Socket을 통해 Offer 전송됨:', offer, roomName);
        } catch (error) {
            console.error('Offer 생성 또는 전송 중 오류 발생:', error);
        }
    }, [roomName]);

    return { sendOffer };
}