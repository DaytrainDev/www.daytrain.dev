"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

const ImageUI = () => {
  const session = useSession();
  const promptRef = useRef(null as any);
  
  const query = useMemo(() => {
    return promptRef.current?.value ?? "";
  }, []);

  function handleGenerate() {
    fetch("/api/image", {
      method: "POST",
      body: JSON.stringify(query),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }

  return session.status === "loading" ? (
    <div>Loading...</div>
  ) : !(session.status === "authenticated") ?  (
    <>
      <div>You need to be logged in to imagine.</div>
      <div className="link-back">
        <a href="/" target="_blank" rel="noreferrer">
          ...back to home
        </a>
      </div>
    </>
  ) : (
    <div className="flex flex-col">
      <div className="flex flex-row items-center">

        <textarea className="text-slate-800" ref={promptRef} rows={4} cols={80} />
      </div>
      <div className="flex flex-row items-center">
        <button
          className="p-4"
          onClick={handleGenerate}
        >
          Generate
        </button>
        <a href="/" rel="noreferrer">
          <button className="p-4">
            Go Home
          </button>
        </a>
      </div>
    </div>
  );
};

const ChatPage = ({ session }: any) => {
  return (
    <SessionProvider session={session}>
      <ImageUI />
    </SessionProvider>
  );
};

export default ChatPage;
