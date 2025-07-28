/**
 * Root layout component for the Next.js application.
 *
 * - Sets up global font variables using Geist Sans and Geist Mono from Google Fonts.
 * - Applies global CSS styles from `globals.css`.
 * - Wraps the application with `ClerkProvider` to enable authentication features.
 * - Configures the HTML document's language and applies font and antialiasing classes to the body.
 * - Defines static metadata for the application, such as the title.
 *
 * @param children - The React node(s) to be rendered within the layout.
 * @returns The root layout structure including authentication context and global styles.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/Providers";
import {Toaster} from 'react-hot-toast'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ask My PDF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <ClerkProvider afterSignOutUrl="/">
    <Providers>
        {children}
        <Toaster/>
    </Providers>
    </ClerkProvider>
    </body>

    </html>
  );
}
