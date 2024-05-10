import React, { useEffect } from "react";
import { getCookie } from "./TestBoard.tsx";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
// import Room from "../components/Roomcomponent.tsx";
import RoomCards from "../components/RoomCards.tsx";

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
    <RoomCards post={post} />
  );
}

export default Mypage;
