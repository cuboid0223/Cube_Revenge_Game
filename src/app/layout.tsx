import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import RecoilContextProvider from "@/providers/recoilContextProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cube",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <RecoilContextProvider>{children}</RecoilContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
