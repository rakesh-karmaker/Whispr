import axios from "axios";
import type React from "react";
import { useEffect, useState } from "react";

interface GoogleAuthResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export default function ProfileSelect(): React.ReactNode {
  const [user, setUser] = useState<GoogleAuthResponse | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        const data = await axios.get(
          `http://localhost:5000/auth/google/get-user/${id}`
        );
        setUser(data.data);
      }
    };
    if (user == null) fetchUser();
  }, []);

  console.log(user);

  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
}
