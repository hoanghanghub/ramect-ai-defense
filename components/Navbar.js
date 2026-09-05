import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useLanguage();
  return (
    <nav className="bg-blue-700 text-white p-4 shadow-md">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <h1 className="font-bold text-xl">{t.appName}</h1>
        <div className="flex items-center space-x-4">
          <Link href="/scan" className="hover:underline">{t.nav.scanner}</Link>
          <Link href="/coach" className="hover:underline">{t.nav.coach}</Link>
          <Link href="/dashboard" className="hover:underline">{t.nav.dashboard}</Link>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}