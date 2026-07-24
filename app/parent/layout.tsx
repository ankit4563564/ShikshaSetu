export default function ParentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section data-portal="parent" aria-label="Parent Portal">{children}</section>;
}
