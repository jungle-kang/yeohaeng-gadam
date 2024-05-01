import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";

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
    }])

    useEffect(()=>{
        const fetchData = async () =>{
            const response = await fetch(`/api/room`,{
                method: 'GET',
                credentials: 'include'
            })
            const data = await response.json()
            console.log(data)
            setPost(data.data)
        }
        fetchData()
    },[])


    return(
        <div className="mt-5">
            {(Array.isArray(post) && post.length === 0) ?(
                <div className="mt-10">글이 없습니다.</div>
            ) : (<div>
                {post.map(({id,title,location,hcMax,startDate,endDate})=>(
                        <div key={id}
                            className="flex p-5 h-40 w-11/12 mt-5 mx-auto mt-5  ring-1 ring-gray-300 rounded-lg shadow-sm">
                            <div className="w-5/6">
                                <div className="font-bold text-xl">{title}</div>
                                <div>목적지 : {location}</div>
                                <div>여행 일자 : {startDate} ~ {endDate}</div>
                                <div>참여 인원 : {hcMax} </div>
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