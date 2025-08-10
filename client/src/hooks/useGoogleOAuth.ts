import { SERVER } from "@/config/constants";
import { verifySession } from "@/lib/api/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./useUser";

const serverURL = SERVER;

type OAuthResponse = {
  new: boolean;
  redisId?: string;
  sessionId?: string;
};

export default function useGoogleOAuth(): {
  authFunc: () => void;
  isOAuthLoading: boolean;
} {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [isOAuthLoading, setIsOAuthLoading] = useState<boolean>(false);

  function authFunc() {
    setIsOAuthLoading(true);
    window.open(
      `${serverURL}/auth/google/`, // new route
      "Google Login",
      "width=500,height=600"
    );

    // Listen for message from popup
    window.addEventListener("message", async (event) => {
      if (event.origin !== serverURL) return; // important for security

      const response: OAuthResponse = event.data.user;
      setIsOAuthLoading(false);

      if (response.new) {
        navigate(`/auth/profile?id=${response.redisId}`);
      } else {
        const sessionId = response.sessionId;
        if (sessionId) {
          const res = await verifySession(sessionId);
          if (res.success) {
            setUser(res.data.user);
            console.log("User verified:", res.data);
            navigate(`/chat`, { replace: true });
          }
        }
      }
    });
  }

  return { authFunc, isOAuthLoading };
}
