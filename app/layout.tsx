import type { Metadata } from 'next';
import { DevRoleShell } from '@/components/dev/DevRoleShell';
import { NotificationProvider } from '@/components/shared/NotificationContext';
import { LanguageProvider } from '@/components/shared/LanguageContext';
import DemoShell from '@/components/demo/DemoShell';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { CampusIdInitializer } from '@/components/campus-id/CampusIdInitializer';
import { CommunityProvider } from '@/components/community/CommunityProvider';
import { SchoolGPTProvider } from '@/components/schoolgpt/SchoolGPTProvider';

export const metadata: Metadata = {
  title: 'ShikshaSetu',
  description: 'ShikshaSetu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y29tcGxldGUtbWFzdG9kcy0yOS5jbGVyay5hY2NvdW50cy5kZXYk';

  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-content" aria-label="Skip to main content">
          Skip to main content
        </a>
        <ClerkProvider publishableKey={clerkKey}>
          <LanguageProvider>
            <NotificationProvider>
              <SchoolGPTProvider>
                <CampusIdInitializer />
                <DevRoleShell><DemoShell><CommunityProvider><main id="main-content" role="main">{children}</main></CommunityProvider></DemoShell></DevRoleShell>
              </SchoolGPTProvider>
            </NotificationProvider>
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
