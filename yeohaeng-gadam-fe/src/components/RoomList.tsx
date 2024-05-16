import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
// import Room from "./Roomcomponent";
import RoomCards from "./RoomCards";

const RoomList = () => {
  const [searchParams] = useSearchParams();
  const [post, setPost] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
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
      setLoading(false);
    };
    fetchData();
  }, [searchParams]);

  return (
    <RoomCards post={post} loading={loading} />
  );
};

export default RoomList;
