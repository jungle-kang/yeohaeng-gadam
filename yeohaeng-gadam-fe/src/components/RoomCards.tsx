import { useNavigate } from "react-router-dom";
import "../index.css";

const RoomCards = ({ post,loading }) => {
    const navigate = useNavigate();

    return (
        <div className="mt-5 pb-10">
            {loading ? (
                <div className="mt-10 flex items-center justify-center">
                    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 4.411 2.686 8.166 6.708 9.708l1.292-2.417z"></path>
                    </svg>
                </div>
            ) : (
                Array.isArray(post) && post.length === 0 ? (
                    <div className="mt-10 flex items-center justify-center">
                        <p>방이 존재하지 않습니다.</p>
                    </div>
                ) : (
                    <div className="mb-10">
                        {post && post.map(({ room_id, title, location, hc_attend, hc_max, start_date, end_date, tags }) => (
                            <div key={room_id}
                                 className="flex p-5 h-42 w-11/12 mx-auto mt-5 mb-5 ring-1 ring-gray-300 rounded-lg shadow-sm">
                                <div className="w-5/6">
                                    <div className="font-bold text-xl">{title}</div>
                                    <div>목적지 : {location}</div>
                                    <div>여행 일자 : {new Date(start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })} ~ {new Date(end_date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                                    <div>참여 인원 : {hc_attend}/{hc_max} </div>
                                    <div className="flex mt-2">
                                        {tags[0] === null ? (<></>) : (tags.map((item, idx) => (
                                            <div key={idx} className="ring-1 w-14 h-7 bg-blue-200 ml-2 text-center pt-1 font-bold rounded-lg text-sm hover:bg-blue-600"
                                                 onClick={() => navigate(`/search?tags=${encodeURIComponent(JSON.stringify([item]))}`)}
                                            >{item}</div>
                                        )))}
                                    </div>
                                </div>
                                <div className="w-1/6 min-w-32 h-full">
                                    <button onClick={() => navigate(`/${room_id}`)} className="bg-white ring-1 ring-gray-300 w-full h-1/3 rounded-lg hover:bg-gray-200 font-bold">
                                        참가하기
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default RoomCards;
