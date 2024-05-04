import React, { useEffect, useState } from 'react';
// import SearchDetail from './SearchDetail';

const { kakao } = window;

const MapContainer = ({ searchPlace, insertCard }) => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
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
    <div style={{ width: '100%', height: '100%' }}>
      <div id="myMap" style={{ width: '100%', height: '50%' }} />
      <div id="result-list">
        {places.map((res, i) => (
          <div
            className="flex-col bg-blue-100 rounded-lg"
            key={i} style={{ marginTop: '20px' }}
          >
            <h5 className="font-bold">
              {res.place_name}
            </h5>
            <div className="text-xs">
              {res.road_address_name ? (
                <div>{res.road_address_name} {res.address_name}</div>
              ) : (
                <div>{res.address_name}</div>
              )}
              <div>{res.phone}</div>
              <br />
              <div><a href={res.place_url}>{res.place_url}</a></div>
              <button
                className="bg-white border-black border-2 m-1"
                onClick={() => insertCard(res)}
              >
                추가하기
              </button>
            </div>
          </div>
        ))}
        {/* {places.length > 0 && <SearchDetail places={places} />} */}
      </div>
    </div>
  );
};

export default MapContainer;