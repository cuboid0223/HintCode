import RecoilRootProvider from "../providers/RecoilRootProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { Metadata } from "next";
import type { Viewport } from "next";

import "@/styles/globals.css";
import "@/styles/prism.css";

import ToastProvider from "@/providers/ToastProvider";

export const metadata: Metadata = {
  title: "HintCode",
  description: "根據學習者狀態提供具體程式建議，以提升 Python 程式能力",
  generator: "Next.js",
  applicationName: "HintCode",
  referrer: "origin-when-cross-origin",
  keywords: ["Python 提示", "GPT 輔助程式學習", "中興大學"],
  authors: [{ name: "CUBE" }],
  creator: "Cube Chen",
  publisher: "NCHU LAB 678",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/HINTCode.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
