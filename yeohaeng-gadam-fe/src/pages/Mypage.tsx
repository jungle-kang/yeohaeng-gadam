import React, { useEffect } from "react";
import { getCookie } from "./TestBoard.tsx";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Room from "../components/Roomcomponent.tsx";

const Mypage = () => {
  const navigate = useNavigate();
  const [post, setPost] = React.useState([]);

  useEffect(() => {
    const accessToken = getCookie('access_token') || '';
    let id = '';
    if (accessToken !== '') {
      id = jwtDecode(accessToken).id;
    } else {
      alert('로그인이 필요합니다.');
      navigate('/');
    }
    const fetchData = async () => {
      const response = await fetch(`/api/entry/user?user_id=${id}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      console.log(data);
      setPost(data.data);
    };
    fetchData();

  }, []);

  return (
    <div className="mt-5">
      {(Array.isArray(post) && post.length === 0) ? (
        <div className="mt-10">글이 없습니다.</div>
      ) : (
        <div>
          {post.map((room) => (
            <Room key={room.room_id} {...room} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Mypage;
