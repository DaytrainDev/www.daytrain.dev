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
  session: Session;
}

const className =
  "cursor-pointer bg-transparent transition-colors duration-300 border-none  decoration-none text-primary-500 hover:bg-primary-600 hover:text-white font-light centered !outline-none text-3xl";
const style = { padding: 0, margin: 0 , minWidth: "48px", minHeight: "48px" };

const handleLogout = async (): Promise<void> => {
  signOut({ callbackUrl: "/" });
};

const handleLogin = async (): Promise<void> => {
  signIn();
};

// const UserMenu = ({
//   session,
// }: {
//   session: {
//     update?: Function;
//     data?: Session | null;
//     status: "loading" | "authenticated" | "unauthenticated";
//   } | null;
//   className?: string;
// }) => {
//   const popupState = usePopupState({ variant: "popover", popupId: "userMenu" });
//   const { isDark, toggleDark } = useDarkMode();
//   const isAuth = useMemo(() => session?.status === "authenticated", [session?.status]);
//   const user = useMemo(() => session?.data?.user, [session?.data?.user]);

//   return (
//     <div className={className}>
//       <Button style={style} className={className} {...bindTrigger(popupState)}>
//         {user?.image ? (
//           <Image
//             alt={`${user?.name}'s avatar`}
//             width={48}
//             height={48}
//             src={user?.image}
//           />
//         ) : (
//           '👤'
//         )}
//         {user?.name && <p className="p-2">{user?.name}</p>}
//       </Button>
//       <Menu {...bindMenu(popupState)}>
//         {/* <MenuItem onClick={popupState.close}>Profile</MenuItem>
//         <MenuItem onClick={popupState.close}>My Account</MenuItem> */}
//         {/* <MenuItem
//             onClick={toggleDark}
//           >
//             Use {isDark ? "Light" : "Dark"} Mode
//           </MenuItem> */}
//         {isAuth ? (
//           <div>
//             <MenuItem
//               onClick={() => {
//                 popupState.close();
//                 handleLogout();
//               }}
//             >Logout</MenuItem>
//           </div>
//         ) : (
//           <MenuItem
//             onClick={() => {
//               popupState.close();
//               handleLogin();
//             }}
//           >
//             Login
//           </MenuItem>
//         )}
//       </Menu>
//     </div>
//   );
// };

// export const Menu = ({ user, url, setUrl }: MenuProps) => {
export const TopBarInner = () => {
  const session = useSession();
  const { data, status, update } = session;
  const isLoading = useMemo(() => status === "loading", [status]);
  // const { isDark, toggleDark } = useDarkMode();
  const isAuth = useMemo(() => session?.status === "authenticated", [session?.status]);
  const user = useMemo(() => session?.data?.user, [session?.data?.user]);

  // const urlRef = useRef({ value: url })

  // const handleGo = async (): Promise<void> => {
  //   setUrl(urlRef.current.value);
  // };

  return !isLoading && (<div
      className={"w-full flex flex-row justify-items-end items-center p-0 m-0 top-0 right-0 absolute bg-gray-700"}
    >
      {/* <UserMenu className={''} session={{ data, status, update }} />
       */}

      <div className="flex flex-row items-center ">
        {user?.image ? (
          <Image
            alt={`${user?.name}'s avatar`}
            width={48}
            height={48}
            src={user?.image}
          />
        ) : (
          '👤'
        )}
        {user?.name && <p className="p-2">{user?.name}</p>}
      </div>
      <div className="p-2">|</div>
      <a href="/"><button className="p-2">Home</button></a>
      
      {isAuth ? (
        <>
          <a href="/chat"><div className="p-2">Chatbot</div></a>
          <a className="p-2" href="/imagen">ImaGen</a>
          <a className="p-2" href="/usweather">US Weather</a>
          <a className="p-2" href="/babylonjs">3D Demo</a>
          <button className="p-2"
            onClick={() => {
              handleLogout();
            }}
          >Logout</button>
        </>
        ) : (
          <button className="p-2"
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
        )}
    </div>);
};

export const TopBar = ({ session }: TopBarProps) => {
  return (
    <SessionProvider session={session}>
      <TopBarInner />
    </SessionProvider>
  );
};
