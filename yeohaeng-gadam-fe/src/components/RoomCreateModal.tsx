import React, { useRef, useEffect, useState } from "react";
import SelectBox from "./SelectBox.tsx";
import {useNavigate} from "react-router-dom";
import {getCookie} from "../pages/TestBoard.tsx";
import {jwtDecode} from "jwt-decode";


interface RoomCreateModalProps {
    onClose: () => void;
}

const RoomCreateModal: React.FC<RoomCreateModalProps> = ({ onClose }) => {
    const accessToken = getCookie('access_token');
    // @ts-ignore
    const id = jwtDecode(accessToken).id;
    const [tags,setTags] = useState([{
        id:'',
        name:''
    }]);

    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement>(null);
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const selectList = [
        '2','3','4',
    ]
    const [selectedItem, setSelectedItem] = useState<string>('2');
    const [form,setForm]=useState({
        title:'',
        location:'',
        hc_max: selectedItem,
        hd_id: id,
        start_date:'',
        end_date:'',
        tags:activeTags,
    });

    const handleSelectChange = (item: string) => {
        setSelectedItem(item);
        setForm(prevForm => ({
            ...prevForm,
            hc_max: item
        }));
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };

    const handleTagClick = (tag: string) => {
        setActiveTags(prevTags => {
            const updatedTags = prevTags.includes(tag)
                ? prevTags.filter((activeTag) => activeTag !== tag)
                : [...prevTags, tag];

            setForm(prevForm => ({
                ...prevForm,
                tags: updatedTags
            }));
            return updatedTags;
        });
    };
    

    const handleSubmit = async ()=>{
        try{
            console.log(JSON.stringify(form))
            const response = await fetch('/api/room', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form)
            })
            const result = await response.json()
            console.log(result)
            if(result.statusCode === 201){
                navigate(`/${result.data.id}`)
            }
        }catch(e){
            console.error('room create fail: ',e)
        }
    }
    useEffect(() => {
        const fetchData = async () =>{
            await fetch('/tags.json')
                .then(res=>res.json())
                .then(result=>setTags(result));
        }
        fetchData()
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            handleClickOutside(event);
        };

        if (modalRef.current) {
            document.addEventListener("mousedown", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [modalRef, handleClickOutside]);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div ref={modalRef} className="z-50 bg-white rounded-md shadow-lg p-4 w-[400px] h-auto">
                <div className="flex">
                    <div className="nanumbarungothic h-8 pt-1 font-bold w-20 text-start">
                        방 이름</div>
                    <input
                        value={form.title}
                        onChange={e => {
                            setForm({
                                ...form,
                                title: e.target.value,
                            })
                        }}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-4 text-gray-900 bg-gray-200 placeholder:text-gray-400 focus:ring-1 focus:bg-white focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="생성할 방 이름을 입력해 주세요"/>
                </div>
                <div className="flex pt-2">
                    <div className="nanumbarungothic h-8 pt-1 font-bold w-20 text-start">여행지</div>
                    <input
                        value={form.location}
                        onChange={e => {
                            setForm({
                                ...form,
                                location: e.target.value,
                            })
                        }}
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-4 text-gray-900 bg-gray-200 placeholder:text-gray-400 focus:ring-1 focus:bg-white focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="여행지를 입력해 주세요"/>
                </div>
                <div className="flex pt-2">
    <div className="nanumbarungothic h-8 pt-1 font-bold w-16 text-start">날짜</div>
    <div className="flex">
        <input
            value={form.start_date}
            onChange={e => {
                setForm({
                    ...form,
                    start_date: e.target.value,
                })
            }}
            type="date"
            className="block w-full rounded-md border-0 text-center h-full px-4 text-gray-900 bg-gray-200 placeholder:text-gray-400 focus:ring-1 focus:bg-white focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
        <input
            value={form.end_date}
            onChange={e => {
                setForm({
                    ...form,
                    end_date: e.target.value,
                })
            }}
            type="date"
            className="block w-full rounded-md border-0 text-center h-full px-5 text-gray-900 bg-gray-200 placeholder:text-gray-400 focus:ring-1 focus:bg-white focus:ring-indigo-600 sm:text-sm sm:leading-6 ml-2"/>
    </div>
</div>

                <div className="flex pt-2 mt-2">
                    <div className="nanumbarungothic h-8 pt-1 font-bold w-14 text-start">인원</div>

                    <SelectBox selectList={selectList} defaultValue={'2'} onSelectChange={handleSelectChange}/>
                </div>
                <div className="flex pt-3 h-auto">
                    <div className="nanumbarungothic h-8 pt-1 font-bold w-12 text-start">태그</div>
                    <div className="ml-2 w-72 h-auto">
                        {tags.map(({id, name}) => (
                            <button key={id}
                                    className={`${activeTags.includes(name) ? "bg-blue-600 text-white" : "bg-white ring-1 ring-gray-400"
                                    } text-sm rounded-2xl w-auto px-2 mx-2 mt-2 hover:bg-blue-100 nanumbarungothic h-8`}
                                    onClick={() => handleTagClick(name)}
                            >
                                {name}
                                </button>
                            )
                        )}
                    </div>
                </div>
                <div className="text-center">
                    <button
                        onClick={handleSubmit}
                        className="nanumbarungothic font-bold h-full mt-5 text-center block w-full rounded-md border-0 py-1.5 px-auto text-white hover:bg-blue-800  bg-blue-600">생성하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomCreateModal;
