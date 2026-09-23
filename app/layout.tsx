import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { UserStoreProvider } from "@/components/providers/user-store-provider";
import employeeData from "@/career_quest_dataset/employees.json";
import { employeeDatasetSchema } from "@/lib/employees";
import "./globals.css";
import { Alice, Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";

const { employees } = employeeDatasetSchema.parse(employeeData);

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <UserStoreProvider employees={employees}>{children}</UserStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
