import RoomCreateModal from "./RoomCreateModal";
import {useState} from "react";

export default function SearchBar(){
    const[isOpen,setIsOpen]=useState(false);

    const createRoomModal = () =>{
        setIsOpen(true);
    }
    const closeModal = () =>{
        setIsOpen(false);
    }

    return (
        <div className="sticky top-0 z-[100] bg-white pt-1 pb-3 shadow">
            <div className="flex flex-low px-10 mt-4">
                <div className="basis-1/5">
                    <input type="text"
                           className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           placeholder="여행지"/>
                </div>
                <div className="basis-1/5">
                    <input type="date"
                           className="block w-full rounded-md border-0 text-center h-full px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
                <div className="basis-1/5">
                    <input type="date"
                           className="block w-full rounded-md border-0 text-center h-full px-4  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
                <div className="basis-1/5">
                    <button
                        className="logo-font font-bold h-full text-center block w-full rounded-md border-0 py-1.5 px-auto text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 hover:text-gray-500 bg-gray-300">
                        방 찾기
                    </button>
                </div>
                <div className="basis-1/5">
                    <button onClick={createRoomModal}
                            className="logo-font font-bold h-full text-center block w-full rounded-md border-0 py-1.5 px-auto text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 hover:text-gray-500 bg-gray-300">
                        방 만들기
                    </button>
                </div>
            </div>
            {isOpen && (
                <RoomCreateModal onClose={closeModal}/>
            )}
        </div>
    );
}
