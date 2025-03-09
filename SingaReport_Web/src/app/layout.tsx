import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ClientPageWrapper from '@/components/common/ClientPageWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SingaReport - Smart Urban Feedback System',
  description: 'Singapore Smart Urban Feedback System, empowering citizens to participate in urban development',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <ClientPageWrapper>
                  {children}
                </ClientPageWrapper>
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 