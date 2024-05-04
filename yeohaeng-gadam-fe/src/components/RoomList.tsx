import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";

interface PostItem {
    id: string;
    title: string;
    location: string;
    hcMax: string;
    startDate: string;
    endDate: string;
    regDate: string;
    modDate: string;
    tags: string[];
}

const RoomList = ()=>{
    const navigate = useNavigate()
    const [post, setPost] = React.useState([{
        id: '',
        title: '',
        location:  '',
        hcMax: '',
        startDate: '',
        endDate:'',
        regDate:'',
        modDate:'',
        tags:['']
    }])

    useEffect(()=>{
        const fetchData = async () =>{
            const response = await fetch(`/api/room`,{
                method: 'GET',
                credentials: 'include'
            })
            const data = await response.json()
            const postWithTag = await data.data.map((item:PostItem) =>{
                return {
                    ...item,
                    tags: ['배낭', '힐링']
                }
            })
            setPost(postWithTag);
        }
        fetchData()
    },[])


    return(
        <div className="mt-5">
            {(Array.isArray(post) && post.length === 0) ?(
                <div className="mt-10">글이 없습니다.</div>
            ) : (<div>
                {post.map(({id,title,location,hcMax,startDate,endDate,tags})=>(
                        <div key={id}
                            className="flex p-5 h-42 w-11/12 mt-5 mx-auto mt-5  ring-1 ring-gray-300 rounded-lg shadow-sm">
                            <div className="w-5/6">
                                <div className="font-bold text-xl">{title}</div>
                                <div>목적지 : {location}</div>
                                <div>여행 일자 : {startDate} ~ {endDate}</div>
                                <div>참여 인원 : {hcMax} </div>
                                <div className="flex mt-2">
                                    {tags.map((item,idx)=>(
                                        <div key={idx} className="ring-1 w-14 h-7 bg-blue-200 ml-2 text-center pt-1 font-bold rounded-lg text-sm ">{item}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-1/6 min-w-32 h-full">
                                <button
                                    onClick={()=>navigate(`/${id}`)}
                                    className="bg-white ring-1 ring-gray-300 w-full h-1/3 rounded-lg hover:bg-gray-200 font-bold">
                                    참가하기
                                </button>
                            </div>
                        </div>
                    ))
                }
                </div>)}
</div>
)
}

export default RoomList