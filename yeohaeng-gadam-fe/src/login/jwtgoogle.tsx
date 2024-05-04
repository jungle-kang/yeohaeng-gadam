import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const GoogleLoginButton = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
        <>
            <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                    onSuccess={credentialResponse => {
                        console.log(jwtDecode(credentialResponse.credential));
                        // console.log(credentialResponse)
                        // 백엔드로 credential 전송
                        fetch(`http://localhost:3000/auth/google/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                token: credentialResponse.credential,
                            }),
                        });
                    }}
                    onError={() => {
                        console.log("Login Failed");
                    }}
                />
            </GoogleOAuthProvider>
        </>
    );
};

export default GoogleLoginButton;