'use client';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import LiveChat from '@/components/shared/LiveChat';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <LiveChat />
    </>
  );
}
