import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../pages/TestBoard.tsx";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SearchFormType {
    location: string,
    start_date: string,
    end_date: string,
    tags: string
    [key: string]: string;
}

export default function SearchBar() {
    const accessToken: string = getCookie('access_token') ? getCookie('access_token') : '';
    let id = '';
    // @ts-ignore
    if (accessToken !== '') {
        id = jwtDecode(accessToken).id;
    }
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState([{
        id: '',
        name: ''
    }])
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [searchForm, setSearchForm] = useState({
        location: '',
        start_date: '',
        end_date: '',
        tags: ''
    });
    const [selectedItem, setSelectedItem] = useState<string>('2');
    const [form, setForm] = useState({
        title: '',
        location: '',
        hcMax: selectedItem,
        startDate: '',
        endDate: '',
        tags: activeTags,
    });

    const searchFormToQueryString = (searchForm: SearchFormType) => {
        const params = new URLSearchParams();
        for (const key in searchForm) {
            if (searchForm[key]) {
                params.append(key, searchForm[key]);
            }
        }
        return params.toString();
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

    const createRoomModal = () => {
        if (id === null) {
            alert('로그인이 필요합니다.')
        } else {
            setIsOpen(true);
        }
    }
    const closeModal = () => {
        setIsOpen(false);
    }
    const handleSearch = async () => {
        const tagsString = JSON.stringify(activeTags);

        const searchParams = new URLSearchParams(
            activeTags.length > 0
                ? {
                    ...searchForm,
                    tags: tagsString
                }
                : searchForm
        ).toString();

        navigate(`/search?${searchParams}`);

        // 방 찾기에 성공한 경우 알림창 띄우기
        toast.success('검색 결과입니다!😎');

        <ToastContainer
                position="top-center"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                // transition: 'Bounce'
            />
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetch('/tags.json')
                .then(res => res.json())
                .then(result => setTags(result));
        }
        fetchData()
    }, []);

    return (
        <div className="sticky top-0 z-[100] bg-white pt-1 pb-3 shadow mt-10">
            <div className="flex flex-low px-10 mt-2">
                <div className="basis-1/5">
                    <input type="text"
                        value={searchForm.location}
                        onChange={e => setSearchForm({
                            ...searchForm,
                            location: e.target.value
                        })}
                        className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="여행지" />
                </div>
                <div className="basis-1/5">
                    <input type="date"
                        onChange={e => setSearchForm({
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
                        onChange={e => setSearchForm({
                            ...searchForm,
                            end_date: e.target.value
                        })}
                        className="block w-full rounded-md border-0 text-center h-full px-4  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
                <div className="basis-1/5">
                    <button
                        onClick={handleSearch}
                        className="logo-font ml-1 font-bold h-full text-center block w-full rounded-md border-0 py-1.5 px-auto text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-200 hover:text-gray-500 bg-gray-300">
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
            <div className="ml-8 mt-8">
                {tags.map(({ id, name }) => (
                    <button key={id}
                        className={`${activeTags.includes(name) ? "bg-blue-300" : "bg-blue-100"
                            } rounded w-auto px-2 mx-2 mt-1 hover:bg-blue-300 logo-font h-8`}
                        onClick={() => handleTagClick(name)}
                    >
                        {name}
                    </button>
                )
                )}
            </div>
            {isOpen && (
                <RoomCreateModal onClose={closeModal} />
            )}
            
        </div>
    );
}
