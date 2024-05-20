import { useNavigate } from "react-router-dom";
import "../index.css";
import { useEffect, useState } from "react";

const RoomCards = ({ post, loading }) => {
    const navigate = useNavigate();
    const [images, setImages] = useState({
        제주도: "",
        서울: "",
        부산: "",
        강릉: "",
        인천: "",
        경주: "",
        가평: "",
        전주: "",
        여수: "",
        속초: "",
        default: "",
    })
    useEffect(() => {
        const fetchData = async () => {
            await fetch('/images.json')
                .then(res => res.json())
                .then(result => setImages(result));
        }
        fetchData()
    }, []);

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
                    <div className="mb-10 ">
                        <div className="border-t-[1px] border-gray-300 w-11/12 mx-auto" />
                        {post && post.map(({ room_id, title, location, hc_attend, hc_max, start_date, end_date, tags }) => (
                            <div
                                className="flex flex-col md:flex-row p-6 h-auto md:h-42 w-11/12 mx-auto border-gray-300 border-b-[1px]"
                                key={room_id}
                            >
                                <div className="flex-shrink-0 min-w-[150px] w-full md:w-[400px]">
                                    <img
                                        className="object-cover h-[200px] w-full md:w-[400px] rounded-2xl"
                                        src={images[location] ? images[location] : images.default}
                                        alt={location}
                                    />
                                </div>
                                <div className="w-full p-3 ml-0 md:ml-5">
                                    <div className="font-bold text-xl nanumbarungothic">{title}</div>
                                    <div className="nanumbarungothic-light flex flex-row items-center mt-2">
                                        <svg
                                            version="1.0"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="15px"
                                            height="15px"
                                            viewBox="0 0 948.000000 1280.000000"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            <g transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
                                                stroke="none">
                                                <path
                                                    fill="#CCCCCC"
                                                    d="M4420 12789 c-943 -64 -1863 -417 -2600 -998 -989 -780 -1620 -1890 -1780 -3131 -59 -455 -49 -840 30 -1209 241 -1122 1084 -2707 2479 -4656 588 -823 1434 -1907 2054 -2633 l137 -162 88 103 c303 353 824 996 1173 1447 1947 2515 3117 4541 3409 5901 79 369 89 754 30 1209 -160 1242 -791 2351 -1780 3131 -908 717 -2075 1076 -3240 998z m501 -299 c447 -20 821 -89 1239 -229 922 -309 1721 -921 2264 -1736 140 -209 218 -345 312 -540 211 -441 351 -920 408 -1400 33 -277 38 -655 11 -845 -76 -529 -286 -1122 -659 -1870 -616 -1232 -1641 -2757 -2995 -4455 -292 -366 -748 -915 -760 -915 -16 0 -529 621 -877 1060 -1085 1372 -1995 2693 -2584 3751 -552 991 -861 1777 -955 2429 -27 190 -22 568 11 845 144 1206 776 2297 1756 3033 697 522 1561 832 2437 871 91 5 171 9 176 9 6 1 103 -3 216 -8z"
                                                />
                                                <path
                                                    fill="#CCCCCC"
                                                    d="M4515 10228 c-487 -49 -964 -277 -1315 -628 -328 -328 -538 -737 -615 -1200 -23 -134 -31 -422 -16 -562 55 -507 277 -973 631 -1328 369 -369 849 -587 1388 -631 360 -30 767 49 1106 215 681 332 1134 983 1217 1744 15 140 7 429 -16 562 -78 463 -285 869 -610 1195 -464 467 -1114 699 -1770 633z m379 -218 c373 -31 730 -167 1031 -393 102 -76 303 -278 379 -380 217 -292 349 -631 386 -996 59 -585 -168 -1193 -598 -1603 -758 -721 -1946 -721 -2704 0 -335 319 -550 762 -598 1231 -48 478 91 972 386 1368 76 102 277 304 379 380 294 221 654 360 1011 391 140 13 193 13 328 2z"
                                                />
                                            </g>
                                        </svg>
                                        <div className="ml-1">{location}</div>
                                    </div>
                                    <div className="nanumbarungothic-light text-sm mt-2">
                                        {new Date(start_date).toLocaleDateString("ko-KR", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        })}{" "}
                                        ~{" "}
                                        {new Date(end_date).toLocaleDateString("ko-KR", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        })}
                                    </div>
                                    <div className="flex items-center space-x-2 mt-2 w-1/3">
                                        <div
                                            className="relative bg-gray-300 rounded h-4 overflow-hidden w-1/3 md:w-1/3">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-blue-600"
                                                style={{ width: `${(hc_attend / hc_max) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="nanumbarungothic text-sm text-blue-600">{hc_attend}</div>
                                            <div className="nanumbarungothic text-sm text-gray-500">/ {hc_max}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap mt-4">
                                        {tags[0] !== null &&
                                            tags.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="ring-1 w-14 h-7 bg-blue-200 mr-2 text-center pt-1 font-bold rounded-lg text-sm hover:bg-blue-600 cursor-pointer"
                                                    onClick={() => navigate(`/search?tags=${encodeURIComponent(JSON.stringify([item]))}`)}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                                <div
                                    className="w-full md:w-1/6 min-w-32 h-8 md:h-full mt-4 md:mt-0 flex justify-center items-center">
                                    <button
                                        onClick={() => navigate(`/${room_id}`)}
                                        className="bg-white ring-1 ring-gray-300 w-full md:w-3/4 h-full md:h-1/3 rounded-lg hover:bg-gray-200 nanumbarungothic"
                                    >
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
