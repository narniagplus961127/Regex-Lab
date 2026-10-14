import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RegexLab — AI regex generator & playground",
  description:
    "Turn plain English into regular expressions. Test patterns live, explore presets, and understand every match.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
