const KakaoLogin = () => {
    const REST_API_KEY = import.meta.env.VITE_KAKAO_LOGIN_API;
    const REDIRECT_URI = 'http://localhost:5173/auth';
    const link = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    const loginHandler = () => {
      window.location.href = link;
    };

    return (
      <button type='button' onClick={loginHandler}>
        <img src="kakao_login_medium_narrow.png" alt="Login with Kakao"/>
      </button>
    );
};

export default KakaoLogin;


