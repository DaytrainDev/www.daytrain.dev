import Image from "next/image";
import { SessionProvider } from "next-auth/react";

const MapItem = (item: any, index: number) => {

  return (
    <div key={index} className="p-8 text-center">
      <a
        href={item.href}
        target={item.target ?? undefined}
        rel="noopener noreferrer"
      >
        <h2 className={`mb-3 text-2xl font-semibold`}>
          {item.title}{" "}
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            -&gt;
          </span>
        </h2>
        <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
          {item.description}
        </p>
      </a>
    </div>
  );
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative flex flex-col place-items-center">
        <h1 className="text-4xl font-bold text-center lg:text-6xl">
          Daytrain.dev
        </h1>
        <p>Stuff I build for me to have stuff I&apos;ve built.</p>
        <div className="flex flex-row items-center justify-center">
          {[
            {
              title: "Weather",
              description: "See weather.",
              href: "/usweather",
            },
            {
              title: "Chat",
              description: "Chat with bot.",
              href: "/chat",
            },
            {
              title: "3D Demo",
              description: "WASD to move.",
              href: "/babylonjs",
            },
          ].map(MapItem)}
        </div>
        <div className="flex flex-row items-center justify-center">
          {[
            {
              title: "Crit-Fumble",
              description: "Pretend with dice.",
              href: "https://www.crit-fumble.com",
              target: "_blank",
            },
            {
              title: "GitHub",
              description: "See code.",
              href: "https://github.com/DaytrainDev",
              target: "_blank",
            },
          ].map(MapItem)}
        </div>
        <div className="flex flex-row items-center justify-center">
          {[
            {
              title: "Discord",
              description: "Say hi.",
              href: "https://discord.gg/jmUjBskedy",
              target: "_blank",
            },
            // {
            //   title: "Twitch",
            //   description: "Watch stream.",
            //   href: "https://www.twitch.tv/daytraindev",
            //   target: "_blank",
            // },
            {
              title: "Patreon",
              description: "Give money.",
              href: "https://www.patreon.com/DaytrainDev",
              target: "_blank",
            },
            // {
            //   title: "Keyhole Software",
            //   description: "Hire devs.",
            //   href: "https://https://keyholesoftware.com/services",
            //   target: "_blank",
            // },
          ].map(MapItem)}
        </div>
      </div>
    </main>
  );
}
