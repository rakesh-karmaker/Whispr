import AuthProfileFrom from "@/components/forms/authForms/profileFrom";
import Loader from "@/components/ui/Loader/Loader";
import { AuthForm } from "@/layouts/authPageLayout";
import { getTempUser } from "@/lib/api/auth";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export type GetTempUserResponse = {
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
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

  if (isLoading || !user) {
    return <Loader />;
  } else {
    return (
      <AuthForm
        title="Set your profile"
        subtitle="Join Whispr and start connecting with your friends"
      >
        <div className="flex flex-col gap-8 items-center">
          <AuthProfileFrom user={user} id={id as string} />

          <p className="text-center font-medium text-gray">
            Already have an account?{" "}
            <NavLink to="/auth/login" className={"text-teal"}>
              Log in
            </NavLink>
          </p>
        </div>
      </AuthForm>
    );
  }
}
