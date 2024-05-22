import React, {useEffect, useState} from 'react';

const {kakao} = window;

const MapContainer = ({searchPlace, insertCard}) => {
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        if (searchPlace == '') {
            return;
        }

        var infowindow = new kakao.maps.InfoWindow({zIndex: 1});
        const container = document.getElementById('myMap');
        const options = {
            center: new kakao.maps.LatLng(33.450701, 126.570667),
            level: 3,
        };
        const map = new kakao.maps.Map(container, options);
        const ps = new kakao.maps.services.Places();

        ps.keywordSearch(searchPlace, placesSearchCB);

        function placesSearchCB(data, status, pagination) {
            if (status === kakao.maps.services.Status.OK) {
                let bounds = new kakao.maps.LatLngBounds();
                for (let i = 0; i < data.length; i++) {
                    displayMarker(data[i]);
                    bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
                }
                map.setBounds(bounds);

                setPlaces(data);
            }
        }

        function displayMarker(place) {
            let marker = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(place.y, place.x),
            });
            kakao.maps.event.addListener(marker, 'click', () => {
                infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
                infowindow.open(map, marker);
            });
        }
    }, [searchPlace]);

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div id="myMap" className="mt-3 w-full" style={{aspectRatio: "2 / 1"}}/>
            <div id="result-list">
                {places.map((res, i) => (
                    <ResultCard key={i} res={res} i={i} insertCard={insertCard}/>
                ))}
            </div>
        </div>
    );
};

function ResultCard({res, i, insertCard}) {
    const [added, setAdded] = useState(false);

    const onClickHandler = (res) => {
        insertCard(res);
        setAdded(true);
    }

    useEffect(() => {
        setAdded(false);
    }, [res]);

    return (
        <div
            className="flex rounded-lg mt-2"
            key={i}
        >
            <div className="w-full pt-2 pb-3">
                <div className="font-bold">
                    {res.place_name}
                </div>
                <div className="text-sm">
                    <div>
                        {res.road_address_name ? res.road_address_name : res.address_name}
                    </div>
                    <div className="text-gray-600 text-xs">{res.category_name}</div>
                    <button
                        className="mt-2 text-blue-700 hover:text-blue-300"
                        onClick={() => window.open("about:blank").location.href = res.place_url}>상세보기
                    </button>
                </div>
            </div>
            <div className="w-[10%] min-w-[40px]">{added ? (
                <button
                    className="bg-[#B0C5E5] rounded-md h-full w-full text-2xl font-bold text-white"
                >
                    √
                </button>

            ) : (
                <button
                    className="bg-gray-200 hover:bg-gray-300 rounded-md h-full w-full text-2xl font-bold text-gray-400"
                    onClick={() => onClickHandler(res)}
                >
                    +
                </button>
            )}

            </div>

        </div>
    );
}

export default MapContainer;