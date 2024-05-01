import React, { useEffect } from "react";
// import styled from "styled-components";


const API_KEY = import.meta.env.VITE_GOOGLE_MAP_API
/*
origin (필수) : 경로의 시작점을 나타낸다. 장소 이름, 위도/경도, place_id를 넣을 수 있다.
destination (필수) : 경로의 종점을 나타낸다. 마찬가지로 장소 이름, 위도/경도, place_id를 넣을 수 있다.
waypoints (선택) : 경유지를 나타낸다. 선택사항이며 경유지가 여럿일 때는 장소 사이에 | 를 추가하여 복수의 장소를 입력할수 있다. 마찬가지로 장소 이름, 위도/경도, place_id를 넣을 수 있다.
mode (선택) : 경로를 표시할 교통수단을 나타낸다. 차량(driving)(기본값), 도보(walking), 대중교통(transit) 등이 있다. 이 때 대중교통을 선택하게 되면 waypoints 값이 무시되며 시작점과 종점 사이의 대중교통 경로만이 표시된다. (구글맵에서 대중교통을 이용한 경로에 경유지 설정이 불가능하다)
zoom (선택) : 지도의 zoom 상태를 나타낸다. 숫자가 높을수록 더 좁은 지역을 보여준다.
*/


function FindWay({ places }) {
    console.log(places)
    return (

        <iframe
            width={"500px"}
            height={"500px"}
            src={`https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=경기대&destination=수원역&mode=transit&zoom=13`}
        />
    );
}

export default FindWay