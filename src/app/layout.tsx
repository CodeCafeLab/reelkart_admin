// This is a placeholder root layout.
// The actual main layout structure (<html>, <body>) is handled by src/app/[locale]/layout.tsx
// to support internationalized routing with next-intl. This file primarily ensures
// global styles are loaded.

import './globals.css'; // Keep global styles accessible

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout should just return children, as the <html> and <body> tags
  // are provided by src/app/[locale]/layout.tsx.
  return <>{children}</>;
}
