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
        <h2 className={`mb-3 text-2xl font-semibold`}>
          {item.title}
        </h2>
        <p className={`m-0 max-w-[30ch] text-sm`}>
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
        <h1 className="text-4xl font-bold text-center lg:text-6xl">
          Daytrain.dev
        </h1>
        <p>Stuff I build for me to have stuff I&apos;ve built.</p>
        <div className="flex flex-row items-center justify-center">
          {[
            {
              title: !session ? "Login" : "Logout",
              description: !session ? "Use apps." : "Done here.",
              href: !session ? "/api/auth/signin" : "/api/auth/signout",
            },
            {
              title: "GitHub",
              description: "See code.",
              href: "https://github.com/DaytrainDev/www.daytrain.dev",
              target: "_blank",
            },
            // {
            //   title: "Patreon",
            //   description: "Give money.",
            //   href: "https://www.patreon.com/DaytrainDev",
            //   target: "_blank",
            // },
          ].map(MapItem)}
        </div>
      </div>
    </main>
  );
}
