import Loader from "@/components/ui/Loader/Loader";
import { getTempUser } from "@/lib/api/auth";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type GetTempUserResponse = {
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
};

export default function AuthProfile(): React.ReactNode {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) navigate("/auth/register");

  const [user, setUser] = useState<GetTempUserResponse | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["temp-user", id],
    queryFn: () => getTempUser(id as string),
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }

    if (isError) {
      navigate("/auth/register");
    }
  }, [data, isError]);

  if (isLoading) {
    return <Loader />;
  } else {
    return <div>hello</div>;
  }
}
