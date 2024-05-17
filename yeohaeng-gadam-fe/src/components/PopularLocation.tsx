import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

const PopularLocation = () => {
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const scrollLeft = () => {
        if (scrollRef.current) {
            // @ts-ignore
            scrollRef.current.scrollLeft -= 700; // 이동할 거리 조절
        }
    };
    const [images,setImages]=useState({
        제주도: "",
        서울:"",
        부산:"",
        강릉:"",
        인천:"",
        경주:"",
        가평:"",
        전주:"",
        여수:"",
        속초:""
    })
    const scrollRight = () => {
        if (scrollRef.current) {
            // @ts-ignore
            scrollRef.current.scrollLeft += 700; // 이동할 거리 조절
        }
    };

    useEffect(() => {
        const fetchData = async () =>{
            await fetch('/images.json')
                .then(res=>res.json())
                .then(result=>setImages(result));
        }
        fetchData()
    }, []);

    return (
        <div className="px-10 pt-4 relative mt-3">
            <h2 className="font-bold">국내 인기 여행지</h2>
            <div className="flex overflow-x-hidden scroll-smooth" ref={scrollRef}>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.제주도}
                             alt="제주도 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=제주도')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        제주도
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.서울}
                             alt="서울 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=서울')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        서울
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.부산}
                             alt="부산 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=부산')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        부산
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.강릉}
                             alt="강릉 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=강릉')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        강릉
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.인천}
                             alt="인천 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=인천')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        인천
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.경주}
                             alt="경주 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=경주')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        경주
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.가평}
                             alt="가평 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=가평')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        가평
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.전주}
                             alt="전주 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=전주')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        전주
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.여수}
                             alt="여수 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=여수')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        여수
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src={images.속초}
                             alt="속초 사진"/>
                        <button
                            onClick={()=>navigate('/search?location=속초')}
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></button>
                    </div>
                    <div className="mt-2 text-sm">
                        속초
                    </div>
                </div>
            </div>
            <button className="px-3 py-1 bg-white shadow-lg rounded-3xl h-10 w-10 top-[55%] transform -translate-y-1/2 left-6 absolute" onClick={scrollLeft}>
                👈
            </button>
            <button className="px-3 py-1 bg-white shadow-lg rounded-3xl h-10 w-10 top-[55%] transform -translate-y-1/2 right-6 absolute" onClick={scrollRight}>
                👉
            </button>
        </div>
    )
}

export default PopularLocation;