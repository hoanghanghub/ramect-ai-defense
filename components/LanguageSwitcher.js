'use client';
import { useLanguage } from '../context/LanguageContext'; 

export default function LanguageSwitcher() {
  const { lang, changeLang } = useLanguage();
  return (
    <div className="flex items-center space-x-1 bg-blue-800 rounded p-1">
      <button 
        onClick={() => changeLang('vi')} 
        className={`px-2 py-1 text-xs font-bold rounded ${lang === 'vi' ? 'bg-white text-blue-700' : 'text-white'}`}>
        VI
      </button>
      <button 
        onClick={() => changeLang('en')} 
        className={`px-2 py-1 text-xs font-bold rounded ${lang === 'en' ? 'bg-white text-blue-700' : 'text-white'}`}>
        EN
      </button>
    </div>
  );
}