import Image from "next/image";
import authConfig from "@/lib/config/auth";
import { getServerSession } from "next-auth";

const MapItem = (item: any, index: number) => {

  return (
    <div key={index} className="p-8 text-center">
      <a
        href={item.href ?? undefined}
        target={item.target ?? undefined}
        rel="noopener noreferrer"
      >
        <h3 className={`mb-3 text-2xl font-semibold`}>
          {item.title}{" "}
        </h3>
        <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
          {item.description}
        </p>
      </a>
    </div>
  );
};

export default async function Home() {
  const session = await getServerSession(authConfig);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative flex flex-col place-items-center">
        <h2 className="text-2xl font-bold text-center lg:text-6xl">
          WIP
        </h2>
        <p>Stuff that &quot;totally works on my machine&quot;, but not live.</p>
        <div className="flex flex-row items-center justify-center">
          {[
            {
              title: "ChatBot",
              description: "Chat Bot.",
              href: "/wip/chat",
            },
            {
              title: "ImaGen",
              description: "Image Generation.",
              href: "/wip/imagen",
            },
          ].map(MapItem)}
        </div>
      </div>
    </main>
  );
}
