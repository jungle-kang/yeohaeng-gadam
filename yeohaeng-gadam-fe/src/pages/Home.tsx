import { ToastContainer, toast } from "react-toastify";
import SearchBar from "../components/SearchBar.tsx";
import RoomList from "../components/RoomList.tsx";
import PopularLocation from "../components/PopularLocation.tsx";
import {useEffect, useState} from "react";

const Home = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        "/img/main/강릉1_1920.jpg",
        "/img/main/강릉2_1920.jpg",
        "/img/main/강릉3_1920.jpg",
        "/img/main/경복궁1_1920.jpg",
        "/img/main/경복궁2_1920.jpg",
        "/img/main/광안대교_1920.jpg",
        "/img/main/서울 불꽃축제_1920.jpg",
        "/img/main/영월_1920.jpg",
        "/img/main/제주_1920.jpg"
    ];

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);
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
            </div>
            <div className="h-auto">
                <SearchBar/>
                <PopularLocation/>
                <RoomList/>
            </div>
        </main>
    )
}

export default Home