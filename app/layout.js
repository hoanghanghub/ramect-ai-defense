import { LanguageProvider } from '@/context/LanguageContext';
import "./globals.css";

export const metadata = {
  title: "RAMECT AI",
  description: "AI Defense System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}