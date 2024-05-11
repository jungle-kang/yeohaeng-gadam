import React, {useEffect, useState} from 'react';

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
    return isActive ? <div className="p-4">{children}</div> : null;
};

const Plan: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [post, setPost] = useState([{

    }])
    useEffect(()=>{

    },[])

    return (
        <>
            <div className="flex">
                <Tab
                    label="Tab 1"
                    onClick={() => setActiveTab(0)}
                    isActive={activeTab === 0}
                />
                <Tab
                    label="Tab 2"
                    onClick={() => setActiveTab(1)}
                    isActive={activeTab === 1}
                />
                <Tab
                    label="Tab 3"
                    onClick={() => setActiveTab(2)}
                    isActive={activeTab === 2}
                />
            </div>
            <Content isActive={activeTab === 0}>
                <p>Content for Tab 1</p>
            </Content>
            <Content isActive={activeTab === 1}>
                <p>Content for Tab 2</p>
            </Content>
            <Content isActive={activeTab === 2}>
                <p>Content for Tab 3</p>
            </Content>
        </>
    );
};

export default Plan;