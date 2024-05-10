import React, {useEffect} from "react";
import {getCookie} from "./TestBoard.tsx";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";

const Mypage = () =>{
    const navigate = useNavigate()
    const [post, setPost] = React.useState([{
        room_id: '',
        title: '',
        location:  '',
        hc_attend:'',
        hc_max: '',
        start_date: '',
        end_date:'',
        regDate:'',
        modDate:'',
        tags:['']
    }])

    useEffect(()=>{
        const accessToken:string = getCookie('access_token')? getCookie('access_token'):'' ;
        let id = '';
        // @ts-ignore
        if(accessToken!== '') {
            id = jwtDecode(accessToken).id;
        }else{
            alert('로그인이 필요합니다.');
            navigate('/');
        }
        const fetchData = async () =>{
            const response = await fetch(`/api/entry/user?user_id=${id}`,{
                method: 'GET',
                credentials: 'include'
            })
            const data = await response.json();
            console.log(data);
            setPost(data.data);
        }
        fetchData()

    },[])
    return (<div className="mt-5">
        {(Array.isArray(post) && post.length === 0) ? (
            <div className="mt-10">글이 없습니다.</div>
        ) : (<div>
            {Array.isArray(post) && post.map(({room_id, title, location, hc_attend, hc_max, start_date, end_date, tags}) => (
                <div key={room_id}
                     className="flex p-5 h-42 w-11/12 mx-auto mt-5  ring-1 ring-gray-300 rounded-lg shadow-sm">
                    <div className="w-5/6">
                        <div className="font-bold text-xl">{title}</div>
                        <div>목적지 : {location}</div>
                        <div>여행 일자 : {new Date(start_date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        })} ~ {new Date(end_date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        })}</div>
                        <div>참여 인원 : {hc_attend}/{hc_max} </div>
                        <div className="flex mt-2">
                            {tags[0] === null ? (<></>) : (tags.map((item, idx) => (
                                <div key={idx}
                                     className="ring-1 w-14 h-7 bg-blue-200 ml-2 text-center pt-1 font-bold rounded-lg text-sm ">{item}</div>
                            )))}
                        </div>
                    </div>
                    <div className="w-1/6 min-w-32 h-full">
                        <button
                            onClick={() => navigate(`/${room_id}`)}
                            className="bg-white ring-1 ring-gray-300 w-full h-1/3 rounded-lg hover:bg-gray-200 font-bold">
                            참가하기
                        </button>
                    </div>
                </div>
            ))
            }
        </div>)}
    </div>)
}

export default Mypage;