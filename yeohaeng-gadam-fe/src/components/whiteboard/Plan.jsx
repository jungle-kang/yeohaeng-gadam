import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

import {
    useStorage,
    useMutation,
    useSelf,
} from "/liveblocks.config";

import SuggestCourse from './SuggestCourse.jsx';

const PLAN_PANEL_HEIGHT = 150;
const SUGGEST_PANEL_HEIGHT = 140;

const Plan = ({ isPlanOpen, setIsPlanOpen, isSuggestOpen, setIsSuggestOpen }) => {
    const insertCard = useMutation(({ storage, self }) => {
        const selectedPageId = self.presence.selectedPageId;
        const selectedCardId = self.presence.selectedCardId;
        if (selectedCardId == null) {
            return;
        }

        const card = storage.get("pages").get(selectedPageId).get("cards").get(selectedCardId);
        if (card.get("cardType") !== "place") {
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
        const selectedPageId = self.presence.selectedPageId;
        const plan = storage.get("pages").get(selectedPageId).get("plan");
        const placeIds = plan.get("placeIds");

        const filteredPlan = placeIds.filter((placeId) => (placeId !== cardId));
        plan.update({
            placeIds: filteredPlan,
        })
    }, []);

    const moveLeftCard = useMutation(({ storage, self }, cardId) => {
        const selectedPageId = self.presence.selectedPageId;
        const plan = storage.get("pages").get(selectedPageId).get("plan");
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
        const selectedPageId = self.presence.selectedPageId;
        const plan = storage.get("pages").get(selectedPageId).get("plan");
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
    }

    const onCardMoveRightClick = (cardId) => {
        moveRightCard(cardId);
    }

    const onCardDeleteClick = (cardId) => {
        deleteCard(cardId);
    }

    const onPlanToggleClick = () => {
        setIsPlanOpen((prev) => !prev);
    }

    const toggleSuggest = () => {
        setIsSuggestOpen((prev) => !prev);
    }

    //////////////////////////// 렌더링 ////////////////////////////
    const selectedPageId = useSelf((self) => self.presence.selectedPageId);
    const placeIds = useStorage((root) => root.pages.get(selectedPageId).plan.placeIds);
    const cards = useStorage((root) => root.pages.get(selectedPageId).cards);

    const planCardList = placeIds.map((cardId) => {
        const card = cards.get(cardId);
        if (!card) {
            return;
        }

        return (
            <div className="relative bg-white w-32 h-20 rounded-md my-4 mx-1 shadow-sm shadow-black"
                key={cardId}
            >
                <div className="nanumbarungothic p-2">
                    {card.placeName}
                </div>
                <button className="bg-gray-200 w-6 rounded-full ring-1 ring-inset ring-gray-500"
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translate(-50%, -50%) translateX(-100%)",
                    }}
                    onClick={() => onCardMoveLeftClick(cardId)}
                >
                    {"<"}
                </button>
                <button className="bg-gray-200 w-6 rounded-full ring-1 ring-inset ring-gray-500"
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translate(-50%, -50%) translateX(100%)",
                    }}
                    onClick={() => onCardMoveRightClick(cardId)}
                >
                    {">"}
                </button>
                <button className="bg-black w-4 h-4 text-xs rounded-full text-white"
                    style={{
                        position: "absolute",
                        left: "100%",
                        top: "0",
                        transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => onCardDeleteClick(cardId)}
                >
                    X
                </button>
            </div>
        );
    });

    return (
        <>
            <div className="absolute bg-white"
                style={{
                    top: `calc(-${isPlanOpen * (PLAN_PANEL_HEIGHT + isSuggestOpen * SUGGEST_PANEL_HEIGHT)}px)`,
                    left: 0,
                    width: "100%",
                    height: "200px",
                    transition: "top 0.2s",
                    zIndex: 0,
                }}
            >
                <SuggestCourse setIsSuggestOpen={setIsSuggestOpen} />
            </div>
            <div className="absolute bg-gradient-to-r from-blue-400 to-blue-600 border-t-2 border-white"
                style={{
                    top: `calc(-${isPlanOpen * PLAN_PANEL_HEIGHT}px)`,
                    left: 0,
                    width: "100%",
                    height: "200px",
                    transition: "top 0.2s",
                    zIndex: 1,
                }}
            >
                <button className="nanumbarungothic absolute bg-white rounded-t-xl border-gray-500  border-r-2"
                    style={{
                        left: "calc(50% - 60px)",
                        top: `calc(-30px - ${isPlanOpen * isSuggestOpen * SUGGEST_PANEL_HEIGHT}px`,
                        width: "120px",
                        height: "30px",
                        transition: "top 0.2s",
                    }}
                    onClick={onPlanToggleClick}
                >
                    일정보기 ▲
                </button>
                <button className="bg-white hover:bg-gray-300 hover:font-bold px-1 rounded-md ml-1 mt-1 nanumbarungothic-light"
                    onClick={insertCard}
                >
                    ✏️일정추가️
                </button>
                <button className="bg-white hover:bg-gray-300 hover:font-bold px-1 rounded-md ml-1 mt-1 nanumbarungothic-light"
                    onClick={toggleSuggest}
                >
                    🪄코스추천
                </button>
                <div className="flex flex-row overflow-x-auto">
                    {planCardList}
                </div>
            </div>
        </>
    );
};

export default Plan;