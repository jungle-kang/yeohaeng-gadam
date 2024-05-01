import './App.css'
import SearchBar from "./components/SearchBar.tsx";
import RoomList from "./components/RoomList.tsx";

function App() {

  return (
      <main className="w-full h-screen">
          <div>
              <img className="object-cover h-[400px] w-full"
                   src="https://images.pexels.com/photos/2407070/pexels-photo-2407070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                   alt="main image"/>
          </div>
          <SearchBar/>
          <RoomList/>
      </main>
  )
}

export default App
