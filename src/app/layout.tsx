import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Crete_Round, Raleway } from "next/font/google";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const creteRound = Crete_Round({
  weight: "400",
  subsets: ["latin"],
});

const raleway = Raleway({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://burningboats.github.io"),
  title: "Burning Boats Official Site",
  description:
    "Welcome to our site. Explore our projects, meet our team, and join our journey to redefine possibilities.",
  keywords: [
    "Burning Boats",
    "gamedev",
    "mexican development",
    "Mindaro",
    "exploration roguelike",
    "videogames",
    "development team",
    "projects",
  ],
  authors: [
    { name: "Burning Boats Team", url: "https://burningboats.github.io" },
  ],
  openGraph: {
    title: "Burning Boats | Explore the Future",
    description:
      "Discover Burning Boats: a hub for creative minds and groundbreaking projects. Meet the team behind the vision.",
    url: "https://burningboats.github.io",
    siteName: "Burning Boats",
    images: [
      {
        url: "/images/og-banner.jpg", // Corrected the path to the updated OG image
        width: 1200,
        height: 630,
        alt: "Burning Boats - Explore the Future",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Burning Boats | Explore the Future",
    description:
      "Join Burning Boats on a journey of exploration and innovation. Discover our team and projects.",
    images: ["/images/og-banner.jpg"], // Updated path here as well
    site: "@burningboats",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#1e293b",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Burning Boats</title>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${raleway.variable} ${creteRound.className} antialiased overflow-hidden`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
