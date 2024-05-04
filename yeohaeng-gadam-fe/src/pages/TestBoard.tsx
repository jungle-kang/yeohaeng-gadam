import React, { useState, useEffect } from 'react';
import { Cookies } from 'react-cookie';
// import axios from "axios";

const cookies = new Cookies();

export const setCookie = (name: string, value: string, options?: any) => {
    return cookies.set(name, value, { ...options });
}

export const getCookie = (name: string) => {
    return cookies.get(name);
}
export const removeCookie = (name: string) => {
    return cookies.remove(name);
}

const BoardList = () => {
    // const [boards, setBoards] = useState([]);

    // useEffect(() => {
    //     const accessToken = Cookies.get('accessToken');
    //     console.log(accessToken);
    //     fetchBoards();
    // }, []);

    // const fetchBoards = async () => {
    //     try {

    //         const response = await fetch(`/api/boards`, {
    //             method: 'GET',
    //             credentials: 'include',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 // 'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJtaW5za3k5MjJAZ21haWwuY29tIiwiZmlyc3ROYW1lIjoibWluIiwibGFzdE5hbWUiOiJreXVuZ3dvb2siLCJwcm9maWxlSW1hZ2UiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJWHdyV0ZiSG80T3RIMGZlZnN3TVNUYVlTX3QxNjg0Sk9Tamd1NTJvT3c3V00xMWZFPXM5Ni1jIiwiaWF0IjoxNzE0NzUyMzQ2LCJleHAiOjE3MTQ3NTU5NDZ9.MM8op0Lj6d94BFmEt78RYLahitLYcKhmcd94k7JaroM',
    //             },
    //             // body: JSON.stringify({}),
    //         });
    //         const data = await response.json()
    //         console.log(data);
    //         if (response.ok) {
    //             const data = await response.json();
    //             console.log(data);
    //             setBoards(data);
    //         } else {
    //             throw new Error('Failed to fetch board data');
    //         }
    //     } catch (error) {
    //         console.error(error.message);
    //     }
    // };

    // return (
    //     <div>
    //         <h2>게시판 목록</h2>
    //         <ul>
    //             {/* {boards.map((board) => (
    //                 <li key={board.id}>{board.title} - {board.description}</li>
    //             ))} */}
    //         </ul>
    //     </div>
    // );
    // const CookieTest = () => {
    //     const onSet = () => {
    //         setCookie('cookieKey', 'cookieValue', {
    //             path: '/',
    //             secure: true,
    //             maxAge: 3000
    //         })
    //     }
    //     const onGet = () => {
    //         const getVal = getCookie('access_token');
    //         console.log(getVal);
    //     }
    //     const onRemove = () => {
    //         removeCookie('cookieKey')
    //     }

    //     return (
    //         <>
    //             <button onClick={onSet} type="button">set cookie</button>
    //             <button onClick={onGet} type="button">get cookie</button>
    //             <button onClick={onRemove} type="button">remove cookie</button>
    //         </>
    //     );
    // };
    // // };

    /* accessToken을 사용하여 게시판 목록을 가져오는 함수 */
    useEffect(() => {
        const accessToken = getCookie('access_token');
        // console.log(accessToken);
        fetchBoards(accessToken); // accessToken을 fetchBoards 함수에 전달합니다.
    }, []);

    const fetchBoards = async (accessToken) => {
        try {
            const response = await fetch(`/api/boards`, {
                method: 'GET',
                credentials: 'include', // 쿠키를 요청에 포함시키기 위해 필요합니다.
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // Authorization 헤더에 accessToken을 추가합니다.
                },
            });
            const data = await response.json()
            // console.log(data);
            if (response.ok) {
                // console.log(data);
            } else {
                throw new Error('Failed to fetch board data');
            }
        } catch (error) {
            console.error(error.message);
        }
    };
}

export default BoardList;
