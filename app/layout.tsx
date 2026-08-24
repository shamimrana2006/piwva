import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "minifimo • 3D Interactive UI Showcase",
  description: "Experience the next-generation interactive 3D UI mockup built with Next.js, Three.js, and React Three Fiber. Move, orbit, drag, and explore in true 3D.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#c5d5d3]">
        {children}
      </body>
    </html>
  );
}
