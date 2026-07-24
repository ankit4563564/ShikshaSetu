import { QuickScanFAB } from '@/components/shared/QuickScanFAB';

export default function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section data-portal="teacher" aria-label="Teacher Portal">
      {children}
      <QuickScanFAB mode="attendance" portal="teacher" label="Quick Scan" />
    </section>
  );
}
