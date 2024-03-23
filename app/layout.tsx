import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { getServerSession } from "next-auth";
import { config } from "@/next-auth";

const inter = Inter({ subsets: ["latin"] });
const emberly = localFont({ src: "../assets/Emberly-Regular.otf" });
import logo from "@/assets/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "./Footer";

export const metadata: Metadata = {
  title: "Dr. Panini",
  description: "Tracking paninis - by TKO-äly",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Dr. Panini",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(config);
  const logged = session?.user !== undefined;
  const authorized = session?.user?.admin;

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-[100dvh]`}>
        <header className="w-full text-black bg-yellow-500">
          <div className="p-4 flex justify-between max-w-[80ch] mx-auto">
            <Link href="/">
              <h1 className={`${emberly.className} text-5xl`}>Dr. Panini</h1>
            </Link>
            <a href="https://tko-aly.fi" target="_blank">
              <Image
                src={logo.src}
                key="logo"
                alt="TKO-äly ry"
                width={48}
                height={48}
              />
            </a>
          </div>
        </header>
        <div className="w-full flex flex-col items-center">{children}</div>
        <Footer logged={logged} />
      </body>
    </html>
  );
}
