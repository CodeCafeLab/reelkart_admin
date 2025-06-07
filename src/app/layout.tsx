// This is a placeholder root layout.
// The actual main layout has been moved to src/app/[locale]/layout.tsx
// to support internationalized routing with next-intl.

import './globals.css'; // Keep global styles accessible

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
