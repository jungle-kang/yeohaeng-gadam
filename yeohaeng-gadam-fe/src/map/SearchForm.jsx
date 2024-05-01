import React, { useRef, useState } from 'react'
import MapContainer from './MapContainer'



function SearchForm({ insertRectangle }) {
    const [InputText, setInputText] = useState('')
    const [Place, setPlace] = useState('')
    const [isClicked, setIsClicked] = useState(false);
    const onChange = (e) => {
        setInputText(e.target.value)
    }
    const onClickHandler = (e) => {
        setIsClicked(true)
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        setPlace(InputText)
        setInputText('')
    }

    return (
        <>
            <form className="inputForm" onSubmit={handleSubmit}>
                <input placeholder="검색어를 입력하세요" onChange={onChange} value={InputText} />
                <button onClick={onClickHandler} type="submit">검색</button>
            </form>
            {/* <MapContainer searchPlace={Place} /> */}
            {<MapContainer searchPlace={Place} insertRectangle={insertRectangle}/>}
        </>
    )
}

export default SearchForm