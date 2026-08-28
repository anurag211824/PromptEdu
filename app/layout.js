import { Geist_Mono, Kumbh_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import UserProvider from "@/contexts/UserContext";
import { Toaster } from "sonner";
import ThemeProvider from "@/contexts/ThemeContext";

const kumbhSans = Kumbh_Sans({
  variable: "--font-kumbh-sans",
  subsets: ["latin"],
});

// Lesson code blocks resolve --font-mono to this. Without it the variable is
// undefined and code inherits the proportional body font, which destroys the
// alignment of indented snippets.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PromptEdu — Turn any topic into a full course",
  description:
    "Describe what you want to learn and get a structured course back, with written lessons, worked examples and matching videos.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="icon" href="/faavicon.png" />
        </head>
        <body className={`${kumbhSans.className} ${geistMono.variable}`}>
          <ThemeProvider>
            <UserProvider>{children}</UserProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
