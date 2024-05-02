
import { useParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { socket } from './socket';
import { useOfferSending } from './useOfferSending.tsx';
import { useSendingAnswer } from './useSendingAnswer.tsx';
import { useAnswerProcessing } from './useAnswerProcessing.tsx';

export function useChatConnection(peerConnection: RTCPeerConnection) {
    const { roomName } = useParams();

    const { sendOffer } = useOfferSending(peerConnection);

    const { handleConnectionOffer } = useSendingAnswer(peerConnection);

    const { handleOfferAnswer } = useAnswerProcessing(peerConnection);

    const handleConnection = useCallback(() => {
        socket.emit('join_room', roomName);
    }, [roomName]);

    const handleReceiveCandidate = useCallback(
        ({ candidate }: { candidate: RTCIceCandidate }) => {
            peerConnection.addIceCandidate(candidate);
        },
        [peerConnection],
    );

    useEffect(() => {
        socket.connect();
        socket.on('answer', handleOfferAnswer);
        socket.on('send_connection_offer', handleConnectionOffer);
        socket.on('another_person_ready', sendOffer);
        socket.on('connect', handleConnection);
        socket.on('send_candidate', handleReceiveCandidate);
        return () => {
            socket.off('answer', handleOfferAnswer);
            socket.off('send_connection_offer', handleConnectionOffer);
            socket.off('another_person_ready', sendOffer);
            socket.off('connect', handleConnection);
            socket.off('send_candidate', handleReceiveCandidate);
        };
    }, [
        roomName,
        handleConnection,
        roomName,
        handleConnectionOffer,
        handleOfferAnswer,
        sendOffer,
        handleReceiveCandidate
    ]);
}