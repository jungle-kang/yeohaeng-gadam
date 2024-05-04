import SearchBar from "../components/SearchBar.tsx";
import RoomList from "../components/RoomList.tsx";
import PopularLocation from "../components/PopularLocation.tsx";
import {useEffect, useState} from "react";

const Home = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        "https://images.pexels.com/photos/2407070/pexels-photo-2407070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        "https://img.freepik.com/fotos-gratis/bela-praia-tropical-e-mar_74190-6803.jpg?t=st=1714794876~exp=1714798476~hmac=799d844086b60f888e3a7fe8c719637c11d60f91c4bbd1b18a55d9c879d574af&w=740",
"https://img.freepik.com/fotos-gratis/bela-praia-tropical-mar-e-areia-com-coqueiro-no-ceu-azul-e-nuvem-branca_74190-7479.jpg?t=st=1714794793~exp=1714798393~hmac=829f69773c83a7037dc30c4192468787247d9e2bfff477a65500e8c770542f1f&w=1200"
    ];

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);
    return (
        <main className="w-full h-screen top-0">
            <div className="h-[400px] w-full relative overflow-hidden">
                {images.map((image, index) => (
                    <img
                        key={index}
                        className={`absolute top-0 left-0 object-cover h-[400px] w-full transition-opacity duration-1000 ${
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