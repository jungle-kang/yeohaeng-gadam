import React, { useState } from 'react'
import MapContainer from './MapContainer'

function SearchPanel({ insertCard }) {
    const [InputText, setInputText] = useState('')
    const [Place, setPlace] = useState('')
    const onChange = (e) => {
        setInputText(e.target.value)
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        setPlace(InputText)
        setInputText('')
    }

    return (
        <>
            <form className="inputForm flex justify-between bg-white shadow-md shadow-gray-300 rounded-md" onSubmit={handleSubmit}>
                <input className="w-9/12 h-10 rounded-full p-2 focus:outline-none" placeholder="검색어를 입력하세요"
                       onChange={onChange} value={InputText}/>

                <button className="relative w-2/12 pl-3 h-10" type="submit">
                    <svg
                        className="absolute"
                        style={{left: '100%', transform: 'translate(-105%, -50%)'}}
                        xmlns="http://www.w3.org/2000/svg"
                        width="35px"
                        height="35px"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                            stroke="#000000"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </form>
            <MapContainer searchPlace={Place} insertCard={insertCard}/>
        </>
    )
}

export default SearchPanel