'use client';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">{t.home.welcome}</h1>
        <p className="mb-6 text-gray-600">{t.home.select}</p>
        <div className="space-x-4">
          <Link href="/scan" className="bg-blue-600 text-white px-6 py-3 rounded-lg">{t.home.startScan}</Link>
          <Link href="/coach" className="bg-green-600 text-white px-6 py-3 rounded-lg">{t.home.startCoach}</Link>
        </div>
      </div>
    </div>
  );
}