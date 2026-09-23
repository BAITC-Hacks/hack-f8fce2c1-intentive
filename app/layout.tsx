import type { Metadata } from "next";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { UserStoreProvider } from "@/components/providers/user-store-provider";
import { loadStarterDataset } from "@/server/repositories/dataset";
import "./globals.css";
import { Alice, Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";

const alice = Alice({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-sans',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Intentive",
  description: "HACK ALEM AGENTIC AI Project.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { warnings: _warnings, ...dataset } = await loadStarterDataset();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${alice.variable} ${cormorantGaramond.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserStoreProvider dataset={dataset}>{children}</UserStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
