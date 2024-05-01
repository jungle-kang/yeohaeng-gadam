import React, { useState, useEffect, useRef } from "react";
// import { Drawer, Rate, Carousel } from 'antd';
// import styled from "styled-components";
// import { Wrapper } from "@googlemaps/react-wrapper";

const API_KEY = import.meta.env.VITE_GOOGLE_MAP_API

function SearchDetail({ places }) {
    const [data, setData] = useState([]);
    // console.log(places[0].place_name)

    useEffect(() => {
        async function getPlaceDetail() {
            try {
                // 비동기 요청을 시작하고, 응답을 기다림
                const response = await fetch(`/maps/api/place/findplacefromtext/json?fields=photos%2Cformatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&input=${places[0].place_name}&inputtype=textquery&key=AIzaSyBBYPfZtATYodCUWXrs3nS0e0YcTkcUDXY`);

                // 응답이 성공적이라면, JSON 형태로 데이터를 파싱
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();

                // 파싱된 데이터를 콘솔에 출력 (디버깅 목적) 및 반환
                // console.log(data);
                setData(result);
            } catch (error) {
                // 에러 처리: 네트워크 에러 또는 데이터 파싱 과정에서 발생한 에러를 콘솔에 출력
                console.error('Error fetching place details:', error);
                // 에러를 다시 발생시켜 호출자에게 알림
                throw error;
            }
        }
        getPlaceDetail()
    }, [places]);
    // console.log(data);

    // const imgUrl = [];
    // console.log(data.candidates[0].photos[0].photo_reference)
    // const photo_reference = data.candidates[0].photos[0].photo_reference;
    // imgUrl.push(
    //     `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo_reference}&key=${API_KEY}`
    // );
    // console.log(imgUrl);


    const renderImages = () => {
        if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].photos || data.candidates[0].photos.length === 0) {
            return null;
        }
        return data.candidates[0].photos.map((photo, i) => (
            <img
                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`}
                alt={`Photo ${i}`}
                key={i}
            />
        ));
    };

    return (

        <div>
            <h4>hello</h4>
            {renderImages()}
        </div>
    );
}

export default React.memo(SearchDetail)