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
  weight: ["300", "400", "500", "600", "700"], // Choose weights for different text usages
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: 'Burning Boats Official Site',
  description: 'Welcome to our site. Explore our projects, meet our team, and join our journey to redefine possibilities.',
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
        url: "https://burningboats.github.io/images/social-banner.jpg",
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
    images: ["https://burningboats.github.io/images/social-banner.jpg"],
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
        <meta property="description" content="Try and figure out what this is about" />
        <meta property="og:title" content="Burning Boats Official Site" />
        <meta property="og:description" content="Welcome to our site. Explore our projects, meet our team, and join our journey to redefine possibilities." />
        <meta property="og:image" content="https://yourdomain.com/images/og-image.jpg" />
        <meta property="og:url" content="https://burningboats.github.io" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Burning Boats" />
        <meta property="og:locale" content="en_US" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${raleway.variable} ${creteRound.className} antialiased overflow-hidden`}>
        <main>{children}</main>
      </body>
    </html>
  );
}