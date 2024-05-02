
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useLocalCameraStream } from './useLocalCameraStream';
import { VideoFeed } from './VideoFeed';
import { VideoChatRoom } from './VideoChatRoom';
// import React from 'react';

export function Stream() {
    const { localStream } = useLocalCameraStream();

    if (!localStream) {
        return null;
    }

    // return <VideoFeed mediaStream={localStream} isMuted={true} />;
    return <VideoChatRoom localStream={localStream} />;
}

// return (
//     <BrowserRouter>
//         <Routes>
//             <Route
//                 path="video-chat-room/:roomName"
//                 element={localStream && <VideoChatRoom localStream={localStream} />}
//             />
//         </Routes>
//     </BrowserRouter>
// );
// };
export default Stream