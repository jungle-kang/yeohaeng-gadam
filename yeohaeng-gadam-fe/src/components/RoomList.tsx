import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Room from "./Roomcomponent";

const RoomList = () => {
  const [searchParams] = useSearchParams();
  const [post, setPost] = React.useState([]);

  const searchFormToQueryString = (searchForm) => {
    const params = new URLSearchParams();
    for (const key in searchForm) {
      if (searchForm[key]) {
        params.append(key, searchForm[key]);
      }
    }
    return params.toString();
  };

  useEffect(() => {
    // Convert searchParams to object
    const searchParamsObject = {
      location: '',
      start_date: '',
      end_date: '',
      tags: ''
    };
    searchParams.forEach((value, key) => {
      searchParamsObject[key] = value;
    });
    // Convert to query string
    const queryString = searchFormToQueryString(searchParamsObject);

    const fetchData = async () => {
      const response = await fetch(`/api/room/?${queryString}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setPost(data.data);
    };
    fetchData();
  }, [searchParams]);

  return (
    <div className="mt-5 pb-10">
      {(Array.isArray(post) && post.length === 0) ? (
        <div className="mt-10">글이 없습니다.</div>
      ) : (
        <div className="mb-10">
          {post.map((room) => (
            <Room key={room.room_id} {...room} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;
