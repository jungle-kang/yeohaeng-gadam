import { FunctionComponent } from 'react';

interface Props {
    mediaStream: MediaStream;
    isMuted?: boolean;
}

export const VideoFeed: FunctionComponent<Props> = ({
    mediaStream,
    isMuted = false,
}) => {
    return (
        <video
            ref={(ref) => {
                if (ref) {
                    ref.srcObject = mediaStream;
                }
            }}
            autoPlay={true}
            muted={isMuted}
        />
    );
};