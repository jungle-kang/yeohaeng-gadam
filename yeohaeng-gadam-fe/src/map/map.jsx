import React, { lazy, Suspense, useEffect, useState } from 'react'
import SearchDetail from './SearchDetail'


const { kakao } = window

const MapContainer = ({ searchPlace }) => {

    //검색결과 배열에 담아둘 상태
    const [places, setPlaces] = useState([])
    useEffect(() => {
        // 마커를 클릭하면 장소명을 표출할 인포윈도우
        var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 })
        //지도를 담을 영역의 DOM 레퍼런스
        const container = document.getElementById('myMap')
        const options = {
            center: new kakao.maps.LatLng(33.450701, 126.570667),// 지도의 중심좌표
            level: 3,// 지도의 확대 레벨
        }

        //지도 생성
        const map = new kakao.maps.Map(container, options)

        // 장소 검색 객체를 생성
        const ps = new kakao.maps.services.Places()

        // 키워드로 장소를 검색
        ps.keywordSearch(searchPlace, placesSearchCB)

        // 키워드 검색 완료 시 호출되는 콜백함수
        function placesSearchCB(data, status, pagination) {
            if (status === kakao.maps.services.Status.OK) {
                let bounds = new kakao.maps.LatLngBounds()

                for (let i = 0; i < data.length; i++) {
                    displayMarker(data[i])
                    bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x))
                }

                map.setBounds(bounds)

                // 페이지 목록 보여주는 displayPagination() 추가
                displayPagination(pagination)
                setPlaces(data)
            }
        }

        // 검색결과 목록 하단에 페이지 번호 표시
        function displayPagination(pagination) {
            var paginationEl = document.getElementById('pagination'),
                fragment = document.createDocumentFragment(),
                i

            // 기존에 추가된 페이지 번호 삭제
            while (paginationEl.hasChildNodes()) {
                paginationEl.removeChild(paginationEl.lastChild)
            }

            for (i = 1; i <= pagination.last; i++) {
                var el = document.createElement('a')
                el.href = '#'
                el.innerHTML = i

                if (i === pagination.current) {
                    el.className = 'on'
                } else {
                    el.onclick = (function (i) {
                        return function () {
                            pagination.gotoPage(i)
                        }
                    })(i)
                }

                fragment.appendChild(el)
            }
            paginationEl.appendChild(fragment)
        }

        // 지도에 마커를 표시하는 함수
        function displayMarker(place) {
            let marker = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(place.y, place.x),
            })

            // 마커에 클릭이벤트를 등록한다
            kakao.maps.event.addListener(marker, 'click', function () {
                // 마커를 클릭하면 장소명이 인포윈도우에 표출된다
                infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>')
                infowindow.open(map, marker)
            })
        }
    }, [searchPlace])



    return (
        <div>
            <div
                id="myMap"
                style={{
                    width: '500px',
                    height: '500px',
                }}>
            </div>
            <div id="result-list">
                {places.map((res, i) => (
                    <div key={i} style={{ marginTop: '20px' }}>
                        <span>{i + 1}</span>
                        <div>
                            <h5>{res.place_name}</h5>
                            {res.road_address_name ? (
                                <div>
                                    <span>{res.road_address_name}</span>
                                    <span>{res.address_name}</span>
                                </div>
                            ) : (
                                <span>{res.address_name}</span>
                            )}
                            <span>{res.phone}</span>
                            <div><a href={`${res.place_url}`}>{res.place_url}</a></div>
                        </div>
                    </div>
                ))}
                <div id="pagination"></div>
                {/* <a
                    target="_blank"
                    onClick={showDrawer}
                    상세보기
                </a> */}
                {/* {console.log('map 에서', places)} */}
                {places.length > 0 && <SearchDetail places={places} />}
            </div>
        </div>


    )
}

export default MapContainer