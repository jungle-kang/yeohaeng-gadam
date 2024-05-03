import SearchBar from "../components/SearchBar.tsx";
import RoomList from "../components/RoomList.tsx";
import PopularLocation from "../components/PopularLocation.tsx";

const Home = () => {
    return (
        <main className="w-full h-screen top-0">
            <div>
                <img className="object-cover h-[400px] w-full"
                     src="https://images.pexels.com/photos/2407070/pexels-photo-2407070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                     alt="main image"/>
            </div>
            <div className="h-screen overflow-y-none">
                <SearchBar/>
                <PopularLocation/>
                <RoomList/>
            </div>
        </main>
    )
}

export default Home