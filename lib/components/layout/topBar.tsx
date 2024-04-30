"use client";
import Button from "@mui/material/Button";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from "material-ui-popup-state/hooks";
// import { Input, MenuItem } from "@mui/material";
import useDarkMode from "@/lib/hooks/useDarkMode";
import { use, useMemo, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { Session } from "next-auth";
// import { useRef } from "react";

interface TopBarProps {
  session: Session | null;
}

const handleLogout = async (): Promise<void> => {
  signOut({ callbackUrl: "/" });
};

const handleLogin = async (): Promise<void> => {
  signIn();
};

export const TopBarInner = () => {
  const session = useSession();
  const isLoading = useMemo(() => session?.status === "loading", [session?.status]);
  // const { isDark, toggleDark } = useDarkMode();
  const isAuth = useMemo(() => session?.status === "authenticated", [session?.status]);
  const user = useMemo(() => session?.data?.user, [session?.data?.user]);

  return !isLoading && (<div
      className={"w-full flex flex-row justify-items-end items-center p-0 m-0 top-0 right-0 absolute bg-gray-700"}
    >
      {/* <UserMenu className={''} session={{ data, status, update }} />
       */}

      <div className="flex flex-row items-center ">
        {user?.image && (
          <Image
            priority
            alt={`${user?.name}'s avatar`}
            width={48}
            height={48}
            src={user?.image}
          />
        )}
        {user?.name && <p className="p-2">{user?.name} |</p>}
      </div>
      
      {isAuth ? (
        <>
          <a href="/"><button className="p-2">Home</button></a>
          <a className="p-2" href="/usweather">US Weather</a>
          <a className="p-2" href="/imagen">ImaGen</a>
          <a className="p-2" href="/chat">ChatBot</a>
          <a className="p-2" href="/cowsay">Cowsay</a>
          <button className="p-2 ml-auto"
            onClick={() => {
              handleLogout();
            }}
          >Logout</button>
        </>
        ) : (
          <button className="p-2 ml-auto"
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
        )}
    </div>);
};

export const TopBarSession = ({ session }: TopBarProps) => {
  return (
    <SessionProvider session={session}>
      <TopBarInner />
    </SessionProvider>
  );
};
