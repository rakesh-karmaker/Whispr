import { useState } from "react";
import { useNavigate } from "react-router-dom";

const serverURL = import.meta.env.VITE_SERVER_URL as string;

type OAuthResponse = {
  email: string;
  new: boolean;
  name?: string;
  avatar?: string;
  redisId?: string;
  firstName?: string;
  lastName?: string;
  id?: string;
  sessionId?: string;
};

export default function useGoogleOAuth(): {
  authFunc: () => void;
  isOAuthLoading: boolean;
} {
  const navigate = useNavigate();

  const [isOAuthLoading, setIsOAuthLoading] = useState<boolean>(false);

  function authFunc() {
    setIsOAuthLoading(true);
    window.open(
      `${serverURL}/auth/google/`, // new route
      "Google Login",
      "width=500,height=600"
    );

    // Listen for message from popup
    window.addEventListener("message", (event) => {
      if (event.origin !== serverURL) return; // important for security

      const response: OAuthResponse = event.data.user;
      setIsOAuthLoading(false);

      if (response.new) {
        navigate(`/auth/profile?id=${response.redisId}`);
      } else {
        console.log(response);
      }
    });
  }

  return { authFunc, isOAuthLoading };
}
