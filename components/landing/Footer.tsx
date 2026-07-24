import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white/75">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 px-6 py-12 md:flex-row lg:px-8">
        <div className="max-w-sm">
          <Link href="/" className="font-display text-xl font-extrabold text-deep-teal">
            ShikshaSetu
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted">
            One connected school day for parents, teachers, and campus teams.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-ink">Product</p>
            <a href="#promises-section" className="block text-muted hover:text-deep-teal">
              Promises
            </a>
            <a href="#tracking" className="block text-muted hover:text-deep-teal">
              Journey
            </a>
            <a href="#demo-section" className="block text-muted hover:text-deep-teal">
              Portals
            </a>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-ink">Access</p>
            <Link href="/demo" className="block text-muted hover:text-deep-teal">
              Watch demo
            </Link>
            <Link href="/sign-in" className="block text-muted hover:text-deep-teal">
              Enter portals
            </Link>
            <a href="mailto:hello@shikshasetu.com" className="block text-muted hover:text-deep-teal">
              Contact
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-7 text-xs text-muted lg:px-8">
        © 2026 ShikshaSetu
      </div>
    </footer>
  );
}
