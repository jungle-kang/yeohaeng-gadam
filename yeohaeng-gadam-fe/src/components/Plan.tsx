import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

interface TabProps {
    label: string;
    onClick: () => void;
    isActive: boolean;
}

const Tab: React.FC<TabProps> = ({ label, onClick, isActive }) => {
    return (
        <button
            className={`text-lg px-4 py-2 mr-2 rounded-t-lg focus:outline-none ${
                isActive ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'
            }`}
            onClick={onClick}
        >
            {label}
        </button>
    );
};

interface ContentProps {
    children: React.ReactNode;
    isActive: boolean;
}

const Content: React.FC<ContentProps> = ({ children, isActive }) => {
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

const Plan: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [activeTab, setActiveTab] = useState<number>(0);
    const [post, setPost] = useState([{
        day: '',
        id: '',
        plans: ''
    }])
    useEffect(() => {
        console.log('roomId:', roomId);
        const dataFetch = async () => {
            try {
                const response = await fetch(`/api/plan/${roomId}`, {
                    method: 'GET',
                    credentials: 'include'
                }).then(res => res.json())

                setPost(response);
            } catch (e) {
                console.log('plan data fetch error : ', e);
            }
        }
        dataFetch();
    }, [])

    return (
        <>
            <div className="flex">
                {Array.isArray(post) && post.map(({ day }, idx) => (
                    <Tab
                        key={idx}
                        label={day + "일차"}
                        onClick={() => setActiveTab(Number(day))}
                        isActive={activeTab === Number(day)}
                    />
                ))}
            </div>
            {Array.isArray(post) && post.map(({ day, plans }, idx) => (
                <Content key={idx} isActive={activeTab === Number(day)}>
                    {plans && typeof plans === 'string' && plans.trim() !== '' ? (
                        <DataCard data={JSON.parse(plans)} />
                    ) : (
                        <p>No plans available for this day</p>
                    )}
                </Content>
            ))}

        </>
    );
};

export default Plan;
