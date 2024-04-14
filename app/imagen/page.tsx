"use client";
import { SessionProvider, useSession } from "next-auth/react";
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from "react";

const ImageUI = () => {
  const session = useSession();
  const [ imageUrl, setImageUrl ] = useState('');
  const promptRef = useRef(null as any);
  
  const prompt = useMemo(() => {
    return promptRef.current?.value ?? "";
  }, []);

  async function handleGenerate() {
    console.log(prompt)
    const imageResponse = await fetch("/api/imagen", {
      method: "POST",
      body: JSON.stringify({
        prompt: promptRef.current?.value,
        size: "1024x1024",
        user: session?.data?.user?.email ?? session?.data?.user?.discord?.id,
        n: 1,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setImageUrl(data?.url ?? imageUrl)
        return data;
      });
    console.log(imageResponse);
  }

  return session.status === "loading" ? (
    <div>Loading...</div>
  ) : !(session.status === "authenticated") ?  (
    <>
      <div>You need to be logged in to imagine.</div>
    </>
  ) : (
    <div className="flex flex-col">
      <h1>ImaGen</h1>
      {imageUrl && <div>
        <Image src={`${imageUrl}`} alt={`${promptRef.current?.value}`} width="1024" height="1024" />
      </div>}
      <div className="flex flex-row items-center border-2 border-solid p-2">
        <textarea className="bg-slate-800 border-2 border-solid p-2" ref={promptRef} rows={4} cols={80} />
      </div>
      <div className="flex flex-row items-center">
        <button
          className="border-2 border-solid p-2"
          onClick={handleGenerate}
        >
          Generate
        </button>
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
