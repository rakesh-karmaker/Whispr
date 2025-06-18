import type React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AuthLayout(): React.ReactNode {
  return (
    <main className="w-screen h-screen min-h-full flex">
      <AuthLeft />
      <div className="px-10 flex-1 w-full h-screen min-h-full flex items-center justify-center">
        <Outlet />
      </div>
    </main>
  );
}

function AuthLeft(): React.ReactNode {
  return (
    <div className="relative w-full max-w-2xl h-full min-h-screen p-10 flex flex-col justify-between  [background:_linear-gradient(0deg,_rgba(0,_0,_0,_0.27),_rgba(0,_0,_0,_0.27)),_url('/auth-layout-image.png')]">
      <NavLink to="/">
        <img src="/logo-white.svg" alt="logo white" className="w-40 h-fit" />
      </NavLink>
      <div className="flex flex-col gap-9">
        <q className="text-white font-semibold text-[2.7375em]/[140%]">
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
        <h2 className="text-black text-[2.4375em]/[140%] font-semibold">
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
