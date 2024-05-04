import React, { useRef, useEffect, useState } from "react";
import SelectBox from "./SelectBox.tsx";
import {useNavigate} from "react-router-dom";


interface RoomCreateModalProps {
    onClose: () => void;
}

const RoomCreateModal: React.FC<RoomCreateModalProps> = ({ onClose }) => {
    const [tags,setTags] = useState([{
        id:'',
        name:''
    }]);

    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement>(null);
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const selectList = [
        '2','3','4','5','6','7','8',
    ]
    const [selectedItem, setSelectedItem] = useState<string>('2');
    const [form,setForm]=useState({
        title:'',
        location:'',
        hcMax: selectedItem,
        startDate:'',
        endDate:'',
        tags:activeTags,
    });

    const handleSelectChange = (item: string) => {
        setSelectedItem(item);
        setForm(prevForm => ({
            ...prevForm,
            hcMax: item
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
                navigate(`/${result.data.rsRoomTagDTO.id}`)
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
                    <div className="logo-font h-8 pt-1 font-bold w-20 text-start">방 이름</div>
                    <input
                        value={form.title}
                        onChange={e => {
                            setForm({
                                ...form,
                                title: e.target.value,
                            })
                        }}
                        className="pl-2 ml-2 w-72 ring-1 ring-inset ring-gray-300 rounded h-8"
                        placeholder="생성할 방 이름을 입력해 주세요"/>
                </div>
                <div className="flex pt-2">
                    <div className="logo-font h-8 pt-1 font-bold w-20 text-start">여행지</div>
                    <input
                        value={form.location}
                        onChange={e => {
                            setForm({
                                ...form,
                                location: e.target.value,
                            })
                        }}
                        className="pl-2 ml-2 w-72 ring-1 ring-inset ring-gray-300 rounded h-8"
                        placeholder="여행지를 입력해 주세요"/>
                </div>
                <div className="flex pt-2">
                    <div className="logo-font h-8 pt-1 font-bold w-20 text-start">날짜</div>
                    <div className="ml-2 w-72 ring-insert ring-1 ring-gray-300 rounded h-8">
                        <input
                            value={form.startDate}
                            onChange={e => {
                                setForm({
                                    ...form,
                                    startDate: e.target.value,
                                })
                            }}
                            type="date" className=""/>
                        <input
                            value={form.endDate}
                            onChange={e => {
                                setForm({
                                    ...form,
                                    endDate: e.target.value,
                                })
                            }}
                            type="date" className="ml-2"/>
                    </div>
                </div>
                <div className="flex pt-2">
                    <div className="logo-font h-8 pt-1 font-bold w-20 text-start">인원</div>
                    <SelectBox selectList={selectList} defaultValue={'2'} onSelectChange={handleSelectChange}/>
                </div>
                <div className="flex pt-3 h-auto">
                    <div className="logo-font h-8 pt-1 font-bold w-20 text-start">태그</div>
                    <div className="ml-2 w-72 h-auto">
                        {tags.map(({id,name})=>(
                                <button key={id}
                                    className={`${
                                        activeTags.includes(name) ? "bg-blue-300" : "bg-blue-100"
                                    } rounded w-auto px-2 mx-2 mt-1 hover:bg-blue-300 logo-font h-8`}
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
                        className="ring-2 mt-5 mb-2 logo-font h-10 w-28 rounded-lg text-gray-800 hover:text-black hover:bg-blue-400">생성하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomCreateModal;
