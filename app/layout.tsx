import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Session } from "next-auth";

import "./globals.css";
import { TopBarSession } from "@/lib/components/layout/topBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daytrain.dev",
  description: "Stuff I build for me to have stuff I've built.",
};

export default function RootLayout({ children, session }: any) {
  return (
    <html lang="en">
      <body className={`${inter.className} w-full`}>
        <TopBarSession session={session} />
        <div className="pt-12">
          {children}
        </div>
      </body>
    </html>
  );
}
