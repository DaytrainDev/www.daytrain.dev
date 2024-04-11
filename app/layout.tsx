import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Session } from "next-auth";

import "./globals.css";
import { TopBar } from "@/lib/components/layout/topBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daytrain.dev",
  description: "Stuff I build for me to have stuff I've built.",
};

export default function RootLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
  session: Session;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopBar session={session} />
        {children}
      </body>
    </html>
  );
}
