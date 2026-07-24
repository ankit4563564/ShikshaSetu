export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section data-portal="admin" aria-label="Admin Mission Control">{children}</section>;
}
