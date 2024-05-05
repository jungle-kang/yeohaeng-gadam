import {useRef} from "react";

const PopularLocation = () => {
    const scrollRef = useRef(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            // @ts-ignore
            scrollRef.current.scrollLeft -= 700; // 이동할 거리 조절
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            // @ts-ignore
            scrollRef.current.scrollLeft += 700; // 이동할 거리 조절
        }
    };
    return (
        <div className="px-10 pt-4 relative">
            <h2 className="font-bold">국내 인기 여행지</h2>
            <div className="flex overflow-x-hidden scroll-smooth" ref={scrollRef}>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src="https://www.agoda.com/wp-content/uploads/2024/02/Jeju-Island-hotels-things-to-do-in-Jeju-Island-South-Korea.jpg"
                             alt="제주도 사진"/>
                        <div
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></div>
                    </div>
                    <div className="mt-2 text-sm">
                        제주도
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src="https://a.cdn-hotels.com/gdcs/production97/d1351/a274bc26-9643-4bae-a91f-cebaf7f9fa56.jpg?impolicy=fcrop&w=800&h=533&q=medium"
                             alt="서울 사진"/>
                        <div
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></div>
                    </div>
                    <div className="mt-2 text-sm">
                        서울
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src="https://cdn.epnc.co.kr/news/photo/202001/93682_85075_3859.jpg"
                             alt="부산 사진"/>
                        <div
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></div>
                    </div>
                    <div className="mt-2 text-sm">
                        부산
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src="https://a.cdn-hotels.com/gdcs/production180/d1313/ee4bae33-8506-4465-b89e-7063878b05aa.jpg?impolicy=fcrop&w=800&h=533&q=medium"
                             alt="강릉 사진"/>
                        <div
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></div>
                    </div>
                    <div className="mt-2 text-sm">
                        강릉
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src="https://a.cdn-hotels.com/gdcs/production181/d952/77e61a1a-d4ef-4f09-b657-ff490a477dff.jpg?impolicy=fcrop&w=800&h=533&q=medium"
                             alt="인천 사진"/>
                        <div
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></div>
                    </div>
                    <div className="mt-2 text-sm">
                        인천
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src="https://t1.daumcdn.net/thumb/R720x0.fjpg/?fname=http://t1.daumcdn.net/brunch/service/user/3yEW/image/Caf9H3cTiPm0et5eIJBiKWNiAT8.jpeg"
                             alt="경주 사진"/>
                        <div
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></div>
                    </div>
                    <div className="mt-2 text-sm">
                        경주
                    </div>
                </div>
                <div className="flex-shrink-0 px-2">
                    <div className="relative overflow-hidden group mt-2">
                        <img className="object-cover h-[150px] w-[200px] rounded-2xl"
                             src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8MQ_lP4EWwS99iYuW5FkTP3imCGtf4UpUHeG5WeOzww&s"
                             alt="가평 사진"/>
                        <div
                            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity rounded-2xl"></div>
                    </div>
                    <div className="mt-2 text-sm">
                        가평
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