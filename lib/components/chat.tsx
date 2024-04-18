"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const ChatUI = ({ handleSubmit }: any) => {
  const session = useSession();

  // Rest of the code
  const [messages, setMessages] = useState<any[]>([]);

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

  const handleSendMessage = async (content: string) => {
    // Send the message to Chat GPT and handle the response
    // You can use a library like axios to make API requests

    // For now, let's just add the message to the list of messages
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
      <input
        className="bg-slate-800  w-100"
        type="text"
        placeholder="Type your message..."
        onKeyDown={(e: any) => {
          if (e.key === "Enter") {
            handleSendMessage(e.target.value);
            e.target.value = "";
          }
        }}
      />
      <div className="flex flex-row items-center">
        <button
          className="border-2 border-solid p-2"
          onClick={(e: any) => {
            handleSendMessage(e.target.value);
          }}
        >
          Send
        </button>
      </div>
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