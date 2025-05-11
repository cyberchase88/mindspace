import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/lib/providers/QueryProvider';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ViewModeProvider } from '@/lib/context/ViewModeContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mindspace - Your Personal Note-Taking Space",
  description: "A gentle, joyful space to grow your thinking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <QueryProvider>
            <ViewModeProvider>
              {children}
            </ViewModeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
