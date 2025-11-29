import { useUser } from "@/hooks/useUser";
import type React from "react";
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AuthPageLayout(): React.ReactNode {
  const { user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  return (
    <main className="w-full h-[100svh] min-h-full flex">
      <AuthLeft />
      <div className="px-10 flex-1 w-full max-2xl:min-w-3xl max-xl:min-w-full h-[100svh] min-h-full flex items-center justify-center">
        <Outlet />
      </div>
    </main>
  );
}

function AuthLeft(): React.ReactNode {
  return (
    <div className="relative max-xl:hidden w-full max-w-2xl h-full min-h-[100svh] p-10 flex flex-col justify-between  [background:_linear-gradient(0deg,_rgba(0,_0,_0,_0.27),_rgba(0,_0,_0,_0.27)),_url('/auth-layout-image.png')]">
      <NavLink to="/">
        <img src="/logo-white.svg" alt="logo white" className="w-40 h-fit" />
      </NavLink>
      <div className="flex flex-col gap-9">
        <q className="text-white font-semibold text-[2.7375em]/[140%] max-2xl:text-4xl">
          Secure, real-time chat built for clarity and connection.
        </q>

        <p className="flex flex-col gap-0.5">
          <span className="text-white-2 text-xl">Rakesh karmaker</span>
          <span className="text-light-gray text-lg">
            Founder and developer of Whispr
          </span>
        </p>
      </div>
    </div>
  );
}

export function AuthForm({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex flex-col gap-7 items-center justify-center">
      <div className="flex flex-col gap-2.5 items-center">
        <h2 className="text-black text-[2.4375em]/[140%] font-semibold text-center max-sm:text-4xl">
          {title}
        </h2>
        <p className="text-light-dark-gray text-lg text-center font-medium max-w-[40ch]">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}
