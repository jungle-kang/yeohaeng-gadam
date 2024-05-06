import RoomCreateModal from "./RoomCreateModal";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
interface SearchFormType{
    location:string,
    start_date:string,
    end_date:string,
    [key: string]: string;
}
export default function SearchBar(){
    const navigate = useNavigate();
    const[isOpen,setIsOpen]=useState(false);
    const[searchForm,setSearchForm]=useState({
        location:'',
        start_date:'',
        end_date:''
    });
    const searchFormToQueryString = (searchForm:SearchFormType) => {
        const params = new URLSearchParams();
        for (const key in searchForm) {
            if (searchForm[key]) {
                params.append(key, searchForm[key]);
            }
        }
        return params.toString();
    };

    const createRoomModal = () =>{
        setIsOpen(true);
    }
    const closeModal = () =>{
        setIsOpen(false);
    }
    const handleSearch = async ()=>{
        // console.log(searchFormToQueryString(searchForm))
        const searchFormQuery = searchFormToQueryString(searchForm);
        // const response = await fetch(`/api/room/?${searchFormQuery}`,{
        //     method:'GET',
        //     credentials: 'include'
        // })
        // const result = await response.json();
        // console.log(result);
        navigate(`/search?${searchFormQuery}`)
    }

    return (
        <div className="sticky top-0 z-[100] bg-white pt-1 pb-3 shadow">
            <div className="flex flex-low px-10 mt-4">
                <div className="basis-1/5">
                    <input type="text"
                           value={searchForm.location}
                           onChange={e=>setSearchForm({
                               ...searchForm,
                               location: e.target.value
                           })}
                           className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           placeholder="여행지"/>
                </div>
                <div className="basis-1/5">
                    <input type="date"
                           onChange={e=>setSearchForm({
                               ...searchForm,
                               start_date: e.target.value,
                           })}
                           value={searchForm.start_date}
                           className="block w-full rounded-md border-0 text-center h-full px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
                <div className="basis-1/5">
                    <input type="date"
                           value={searchForm.end_date}
                           onChange={e=>setSearchForm({
                               ...searchForm,
                               end_date: e.target.value
                           })}
                           className="block w-full rounded-md border-0 text-center h-full px-4  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
                <div className="basis-1/5">
                    <button
                        onClick={handleSearch}
                        className="logo-font font-bold h-full text-center block w-full rounded-md border-0 py-1.5 px-auto text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 hover:text-gray-500 bg-gray-300">
                        방 찾기
                    </button>
                </div>
                <div className="basis-1/5 ml-2">
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
