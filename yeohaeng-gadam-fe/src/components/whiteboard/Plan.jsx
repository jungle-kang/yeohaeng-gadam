import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import SelectBox from "../SelectBox.tsx";

import {
    useStorage,
    useMutation,
    useBroadcastEvent,
    useMyPresence,
    useSelf,
    useOthers,
    useHistory,
} from "/liveblocks.config";

// import Recommend from '../../map/recommendProto.jsx';
import SuggestCourse from './SuggestCourse.jsx';

const PLAN_PANEL_HEIGHT = 200;
const SUGGEST_PANEL_HEIGHT = 200;

const Tab = ({ label, onClick, isActive }) => {
    return (
        <button
            className={`text-lg px-4 py-2 mr-2 rounded-t-lg focus:outline-none ${isActive ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'
                }`}
            onClick={onClick}
        >
            {label}
        </button>
    );
};

const Content = ({ children, isActive }) => {
    return isActive ? <div className="p-4 flex justify-start items-center">{children}</div> : null;
};

const DataCard = ({ data }) => {
    const dataObject = data;
    const getBgColor = (type) => {
        switch (type) {
            case "card":
                return "bg-blue-200";
            case "transportation":
                return "bg-green-200";
            default:
                return "bg-gray-200";
        }
    };

    return (
        <div className="flex flex-wrap">
            {Array.isArray(dataObject) && dataObject.map(({ info, type }, index) => (
                <div
                    key={index}
                    className={`w-auto h-auto p-4 mb-4 mr-4 border border-gray-300 rounded-lg ${getBgColor(type)}`}
                >
                    {info}
                </div>
            ))}
        </div>
    );
};

const Plan = () => {
    const { roomId } = useParams();
    const [activeTab, setActiveTab] = useState(0);
    const [post, setPost] = useState([{
        day: '',
        id: '',
        plans: ''
    }])
    const [inputs, setInputs] = useState([]);
    const [inputData, setInputData] = useState({
        day: '',
        type: 'card',
        info: ''
    })
    const [add, setAdd] = useState(false);
    const handleSelectChange = (item) => {
        setInputData(prevForm => ({
            ...prevForm,
            type: item
        }))
    }
    const handleButton = () => {
        setAdd(false);
        //todo 현재 inputData의 day와 같은 inputs에 plans에 type과 info가 있는 json을 plans에 append 해야함 .
        //만약 inputs에 inputData의 day가 없다면, 추가
        const { day, type, info } = inputData;

        // 입력된 정보가 유효한지 확인
        if (!day.trim() || !type.trim() || !info.trim()) {
            console.error('Day, type, 또는 info가 비어 있습니다.');
            return;
        }

        // 해당하는 day가 이미 inputs에 있는지 확인
        const existingDayIndex = inputs.findIndex(input => input.day === day);

        if (existingDayIndex !== -1) {
            // 이미 해당하는 day가 inputs에 존재하는 경우
            const updatedInputs = [...inputs];
            const existingPlans = updatedInputs[existingDayIndex].plans;

            updatedInputs[existingDayIndex].plans = [
                ...existingPlans,
                { type, info }
            ];
            const patchPlan = async () => {
                const patchbody = JSON.stringify({
                    plans: JSON.stringify([
                        ...existingPlans,
                        { type, info }
                    ])
                });
                console.log('patchbody?', patchbody);
                try {
                    const response = await fetch(`api/plan/${roomId}/${day}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: patchbody,
                    }).then(res => res.json())
                    console.log(response);
                } catch (e) {
                    console.log('patch plan error: ', e);
                }
            }
            patchPlan();
            setInputs(updatedInputs);
        } else {
            // 해당하는 day가 inputs에 없는 경우
            setInputs(prevInputs => [
                ...prevInputs,
                {
                    room_id: roomId,
                    day,
                    plans: [{ type, info }]
                }
            ]);
            const postPlan = async () => {
                const postBody = JSON.stringify({
                    plans: JSON.stringify([
                        { type, info }
                    ])
                });
                console.log('postBody:', postBody);
                const response = await fetch(`api/plan/${roomId}/${day}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: postBody,
                    });
                console.log(response);
            }
            postPlan();
        }
        // inputData 초기화
        setInputData({
            day: '',
            type: 'card',
            info: ''
        });
        setAdd(true);
    }
    useEffect(() => {
        console.log(inputs);
        console.log('roomId:', roomId);
        const dataFetch = async () => {
            try {
                const response = await fetch(`/api/plan/${roomId}`, {
                    method: 'GET',
                    credentials: 'include'
                }).then(res => res.json())
                    .then(res => res.map(item => ({
                        room_id: item.id.toString(),
                        day: item.day.toString(),
                        plans: JSON.parse(item.plans)
                    })))
                console.log('response:', response);
                setInputs(response);
            } catch (e) {
                console.log('plan data fetch error : ', e);
            }
        }
        dataFetch();
    }, [])
    useEffect(() => {
        console.log('inputs:', inputs);
    }, [add]);

    const selectedPageId = useSelf((self) => self.presence.selectedPageId);
    // const page = useStorage((root) => root.pages.get(selectedPageId));
    // const plan = useStorage((root) => root.pages.get(selectedPageId).plan);
    // const plan = page ? page.plan : null;
    // const placeIds = plan ? plan.placeIds : null;
    const placeIds = useStorage((root) => root.pages.get(selectedPageId).plan.placeIds);
    const cards = useStorage((root) => root.pages.get(selectedPageId).cards);

    // console.log("placeIds", placeIds);

    const insertCard = useMutation(({ storage, self }) => {
        const selectedCardId = self.presence.selectedCardId;
        if (selectedCardId == null) {
            return;
        }

        const plan = storage.get("pages").get(selectedPageId).get("plan");
        const placeIds = plan.get("placeIds");

        if (placeIds.includes(selectedCardId)) {
            return;
        }

        const newPlan = [...placeIds, selectedCardId];
        plan.update({
            placeIds: newPlan,
        })
    }, []);

    const deleteCard = useMutation(({ storage, self }, cardId) => {
        const plan = storage.get("pages").get(selectedPageId).get("plan");
        // const placeIds = plan.placeIds;
        const placeIds = plan.get("placeIds");

        const filteredPlan = placeIds.filter((placeId) => (placeId !== cardId));
        plan.update({
            placeIds: filteredPlan,
        })
    }, []);

    const moveLeftCard = useMutation(({ storage, self }, cardId) => {
        const plan = storage.get("pages").get(selectedPageId).get("plan");
        // const placeIds = plan.placeIds;
        const placeIds = plan.get("placeIds");

        const cardIdx = placeIds.findIndex((placeId) => (placeId === cardId));
        if (cardIdx == 0) {
            return;
        }

        const filteredPlan = placeIds.filter((placeId) => (placeId !== cardId));

        const newPlan = [
            ...filteredPlan.slice(0, cardIdx - 1),
            cardId,
            ...filteredPlan.slice(cardIdx - 1),
        ]
        plan.update({
            placeIds: newPlan,
        })
    }, []);

    const moveRightCard = useMutation(({ storage, self }, cardId) => {
        const plan = storage.get("pages").get(selectedPageId).get("plan");
        // const placeIds = plan.placeIds;
        const placeIds = plan.get("placeIds");

        const cardIdx = placeIds.findIndex((placeId) => (placeId === cardId));
        if (cardIdx == placeIds.length - 1) {
            return;
        }

        const filteredPlan = placeIds.filter((placeId) => (placeId !== cardId));

        const newPlan = [
            ...filteredPlan.slice(0, cardIdx + 1),
            cardId,
            ...filteredPlan.slice(cardIdx + 1),
        ]
        plan.update({
            placeIds: newPlan,
        })
    }, []);


    // 목록 수정 버튼
    const onCardMoveLeftClick = (cardId) => {
        moveLeftCard(cardId);
        console.log("updated: ", placeIds);
    }

    const onCardMoveRightClick = (cardId) => {
        moveRightCard(cardId);
        console.log("updated: ", placeIds);
    }

    const onCardDeleteClick = (cardId) => {
        deleteCard(cardId);
        console.log("updated: ", placeIds);
    }



    const [isPlanOpen, setIsPlanOpen] = useState(false);
    // 추천 기능
    const [isSuggestOpen, setIsSuggetsOpen] = useState(false);

    const onPlanToggleClick = () => {
        setIsPlanOpen((prev) => !prev);
    }

    const toggleSuggest = () => {
        setIsSuggetsOpen((prev) => !prev);
    }

    return (
        <>
            <div className="absolute bg-yellow-300"
                style={{
                    top: `calc(-${isPlanOpen * (PLAN_PANEL_HEIGHT + isSuggestOpen * SUGGEST_PANEL_HEIGHT)}px)`,
                    left: 0,
                    width: "100%",
                    height: "200px",
                    transition: "top 0.2s",
                    zIndex: 0,
                }}
            >
                <SuggestCourse />
            </div>
            <div className="absolute bg-red-300"
                style={{
                    top: `calc(-${isPlanOpen * PLAN_PANEL_HEIGHT}px)`,
                    left: 0,
                    width: "100%",
                    height: "200px",
                    transition: "top 0.2s",
                    zIndex: 1,
                }}
            >
                <button className="absolute bg-red-500"
                    style={{
                        left: "calc(100% - 40px)",
                        top: "-30px",
                        width: "40px",
                        height: "30px",
                    }}
                    onClick={onPlanToggleClick}
                >
                    PLAN
                </button>
                <button className="bg-white"
                    onClick={insertCard}
                >
                    일정추가
                </button>
                <button className="bg-white"
                    onClick={toggleSuggest}
                >
                    코스추천
                </button>
                <div>
                    {placeIds.map((cardId) => {
                        const card = cards.get(cardId);
                        return (
                            <div className="bg-green-100"
                                key={cardId}
                            >
                                {card.placeName}
                                <button className="bg-white"
                                    onClick={() => onCardMoveLeftClick(cardId)}
                                >
                                    {"<"}
                                </button>
                                <button className="bg-white"
                                    onClick={() => onCardMoveRightClick(cardId)}
                                >
                                    {">"}
                                </button>
                                <button className="bg-white"
                                    onClick={() => onCardDeleteClick(cardId)}
                                >
                                    X
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );

    // return (
    //     <>
    //         <Recommend />
    //         <div className="flex">
    //             {Array.isArray(inputs) && inputs.map(({ day }, idx) => (
    //                 <Tab
    //                     key={idx}
    //                     label={day + "일차"}
    //                     onClick={() => setActiveTab(Number(day))}
    //                     isActive={activeTab === Number(day)}
    //                 />
    //             ))}
    //             <div className="flex pl-2 pt-2">
    //                 <input
    //                     value={inputData.day}
    //                     onChange={e => {
    //                         setInputData({
    //                             ...inputData,
    //                             day: e.target.value,
    //                         })
    //                     }}
    //                     className="border rounded-lg h-9 w-12 mr-2" placeholder="일차" type="text" />
    //                 <SelectBox selectList={['card', 'transportation']} defaultValue={'card'}
    //                     onSelectChange={handleSelectChange} />
    //                 <input
    //                     value={inputData.info}
    //                     onChange={e => {
    //                         setInputData({
    //                             ...inputData,
    //                             info: e.target.value,
    //                         })
    //                     }}
    //                     className="border rounded-lg w-42 h-9 ml-4" placeholder="내용" type="text" />
    //                 <button
    //                     onClick={handleButton}
    //                     type="button" className="ml-4 bg-orange-300 w-12 rounded-lg font-bold text-sm hover:bg-orange-400">추가</button>
    //             </div>
    //         </div>
    //         {Array.isArray(inputs) && inputs.map(({ day, plans }, idx) => (
    //             <Content key={idx} isActive={activeTab === Number(day)}>
    //                 <DataCard data={plans} />
    //             </Content>
    //         ))}

    //     </>
    // );
};

export default Plan;
