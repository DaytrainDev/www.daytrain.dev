"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const getBotResponse = (messages: any, setMessages: Function, user: string) => {
  return (
    fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res?.json())
      .then((message) => {
        setMessages((prevMessages: any) => {
          return [...prevMessages, message];
        });
      })
      .catch((err: Error) => console.error(err))
  );
};

const ChatUI = () => {
  const session = useSession();

  // Rest of the code
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (session.data?.user && messages.length > 0) {
      if (messages[messages.length - 1]?.role !== "assistant") {
        getBotResponse(
          messages,
          setMessages,
          session.data?.user?.discord?.id ??
            session.data?.user?.email ??
            session.data?.user.name
        );
      }
    }
    return () => {};
  }, [messages, session.data?.user]);

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
        <h1 className="border-slate-100 border-2 border-solid p-2">Chatbot</h1>
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

const ChatPage = ({ session }: any) => {
  return (
    <SessionProvider session={session}>
      <ChatUI />
    </SessionProvider>
  );
};

export default ChatPage;
