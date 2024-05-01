import {useNavigate} from "react-router-dom";

export default function Header(){
    const navigate = useNavigate();
    return (
        <header className="w-full h-20 flex flex-low bg-white mt-2">
            <button
                onClick={()=>navigate('/')}
                className="basis-1/5 font-bold text-4xl p-4 logo-font">
                여행가담
            </button>
            <div className="basis-3/5"></div>
            <div className="basis-1/5 h-full">
                <button className="w-1/2 h-full logo-font hover:text-gray-400">signIn</button>
                <button className="w-1/2 h-full logo-font hover:text-gray-400">signUp</button>
            </div>
        </header>
    )
}
