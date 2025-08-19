
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { ChatbotTrigger } from '@/components/layout/chatbot-trigger';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'HackHub',
  description: 'Empowering developers to build the next generation of solutions through collaborative hackathons.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
            <AppFooter />
            <ChatbotTrigger />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
