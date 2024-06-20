import RecoilRootProvider from "../providers/RecoilRootProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { Metadata } from "next";
import type { Viewport } from "next";
// import Document from "next/document";

import "@/styles/globals.css";
import "@/styles/prism.css";

import ToastProvider from "@/providers/ToastProvider";

export const metadata: Metadata = {
  title: "HintCode",
  description: "提供 GPT 產生的個人化提示，提升程式能力",
  generator: "Next.js",
  applicationName: "HintCode",
  referrer: "origin-when-cross-origin",
  keywords: ["Next.js", "React", "TypeScript"],
  authors: [{ name: "CUBE" }],
  creator: "Cube Chen",
  publisher: "NCHU LAB 678",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  //   maximumScale: 1,
  //   userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
    The root layout is defined at the top level of the app directory and applies to all routes. 
    This layout is required and must contain html and body tags, 
    allowing you to modify the initial HTML returned from the server.
    */
    <html lang="en">
      <body>
        <RecoilRootProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </RecoilRootProvider>
      </body>
    </html>
  );
}
