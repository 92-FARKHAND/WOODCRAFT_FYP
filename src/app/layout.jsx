import "./globals.css";
import { JetBrains_Mono, Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });


import { Providers } from "@/components/Providers";

export default async function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("dark", geist.variable, "font-mono", geistMono.variable)}>
      <body className="">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}