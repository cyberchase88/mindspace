import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/lib/providers/QueryProvider';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ViewModeProvider } from '@/lib/context/ViewModeContext';
import { ChatProvider } from '@/components/features/ChatProvider';
import ChatSidePanel from '@/components/features/ChatSidePanel';
import { NoteProvider } from '@/lib/context/NoteContext';
import React from 'react';
import CompanionHeader from '@/components/CompanionHeader';
import AppSidebar from '@/components/features/AppSidebar';

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
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <QueryProvider>
            <ViewModeProvider>
              <NoteProvider>
                <ChatProvider>
                  <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
                    <AppSidebar />
                    <div style={{ flex: 1, marginLeft: 280 }}>
                      <CompanionHeader />
                      {children}
                      <ChatSidePanel />
                    </div>
                  </div>
                </ChatProvider>
              </NoteProvider>
            </ViewModeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
