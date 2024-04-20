"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const ChatUI = ({ handleSubmit }: any) => {
  const session = useSession();

  // Rest of the code
  const [messages, setMessages] = useState<any[]>([]);
  const promptRef = useRef(null as any);

  const handleBotResponse = async (messages: any) => {
    if (session?.data?.user && messages.length > 0) {
      if (messages[messages.length - 1]?.role !== "assistant") {
        const message = await handleSubmit(
          messages,
          session.data?.user?.discord?.id ??
            session.data?.user?.email ??
            session.data?.user.name
        );

        setMessages((prevMessages: any) => {
          return [...prevMessages, message];
        });
      }
    }
  }

  useEffect(() => {
    handleBotResponse(messages);

    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleSendMessage = async () => {
    const content = promptRef.current?.value;
    promptRef.current.value = "";
    setMessages((prevMessages) => {
      return [...prevMessages, { content, role: "user" }];
    });
  };

  return session.status === "loading" ? (
    <div>Loading...</div>
  ) : !(session.status === "authenticated") ?  (
    <>
      <div>You need to be logged in to chat.</div>
    </>
  ) : (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center">
        <h1 className="border-slate-100 border-2 border-dashed p-2">Chatbot</h1>
      </div>
      <div className="border-slate-100 border-2 border-solid p-2">
        {messages.map((message, index) => (
          <p key={index}>
            {message.role}: {message.content}
          </p>
        ))}
      </div>        
      <textarea className="bg-slate-800 border-2 border-solid p-2" 
          ref={promptRef} 
          rows={1} cols={60} 
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          className="border-2 border-solid p-2"
          onClick={handleSendMessage}
        >
          Send
        </button>
    </div>
  );
};

export const ChatSession = ({ session, handleSubmit }: any) => {
  return (
    <SessionProvider session={session}>
      <ChatUI handleSubmit={handleSubmit}/>
    </SessionProvider>
  );
};