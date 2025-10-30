import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "RefiBadges",
  description: "Suivi d'habitudes avec badges – MVP"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
