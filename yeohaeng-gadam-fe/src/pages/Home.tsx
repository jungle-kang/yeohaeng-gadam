import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar.tsx";
import RoomList from "../components/RoomList.tsx";
import PopularLocation from "../components/PopularLocation.tsx";

const Home = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        // "/img/main/강릉1_1920.jpg",
        // "/img/main/강릉2_1920.jpg",
        // "/img/main/강릉3_1920.jpg",
        // "/img/main/경복궁1_1920.jpg",
        "/img/main/경복궁2_1920.jpg",
        "/img/main/영월_1920.jpg",
        "/img/main/광안대교_1920.jpg",
        // "/img/main/서울 불꽃축제_1920.jpg",
        "/img/main/제주_1920.jpg"
    ];

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 6000);

        return () => clearInterval(intervalId);
    }, [images.length]);

    return (
        <main className="w-full h-screen top-0">
            <div className="h-[450px] w-full relative overflow-hidden">
                {images.map((image, index) => (
                    <img
                        key={index}
                        className={`absolute top-0 left-0 object-cover h-[450px] w-full transition-opacity duration-1000 ${
                            index === currentImageIndex ? "opacity-100" : "opacity-0"
                        }`}
                        src={image}
                        alt={`Image ${index}`}
                    />
                ))}
                <div className="absolute top-0 left-0 w-full h-[450px] flex items-center justify-start pl-20">
                    <div>
                        <h3 className="tracking-tight text-white text-xl md:text-2xl shadow-5xl">동시계획 화이트보드</h3>
                        <h3 className="nanumbarungothic tracking-wide text-white text-2xl md:text-4xl shadow-5xl">여행계획은 여행가담</h3>
                    </div>

                </div>
            </div>
            <div className="h-auto px-4 sm:px-6 lg:px-8 py-6">
                <SearchBar/>
                <PopularLocation />
                <RoomList />
            </div>
        </main>
    );
}

export default Home;
