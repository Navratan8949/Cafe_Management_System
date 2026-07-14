import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";

// Display face: warm, characterful serif for headings — the brand's voice
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

// Body/UI face: clean grotesk for dense dashboard legibility
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

// Ticket face: monospace for prices, order numbers, table numbers — the receipt motif
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-ticket",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roast & Ticket | Cafe Management System",
  description: "Manage your cafe easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
