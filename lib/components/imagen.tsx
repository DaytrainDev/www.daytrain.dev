"use client";
import { SessionProvider, useSession } from "next-auth/react";
import Image from 'next/image'
import { useMemo, useRef, useState } from "react";

const ImagenUI = ({handleSubmit}: any) => {
  const session = useSession();
  const [ imageUrl, setImageUrl ] = useState('');
  const promptRef = useRef(null as any);
  
  const prompt = useMemo(() => {
    return promptRef.current?.value ?? "";
  }, []);

  async function handleGenerate() {
    const imageResponse = await handleSubmit(prompt, session?.data?.user?.email ?? session?.data?.user?.discord?.id)
    setImageUrl(imageResponse?.url ?? imageUrl)
  }

  return session.status === "loading" ? (
    <div>Loading...</div>
  ) : !(session.status === "authenticated") ?  (
    <>
      <div>You need to be logged in to imagine.</div>
    </>
  ) : (
    <div className="flex flex-col items-center">
    <div className="flex flex-row items-center">
      <h1 className="border-slate-100 border-2 border-dashed p-2">ImaGen</h1>
    </div>
      {imageUrl && <div>
        <Image src={`${imageUrl}`} alt={`${promptRef.current?.value}`} width="1024" height="1024" />
      </div>}
      <div className="flex flex-row items-center border-2 border-solid p-2">
        <textarea className="bg-slate-800 border-2 border-solid p-2" ref={promptRef} rows={4} cols={60} />
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

export const ImagenSession = ({ session, handleSubmit }: any) => {
  return (
    <SessionProvider session={session}>
      <ImagenUI handleSubmit={handleSubmit} />
    </SessionProvider>
  );
};
