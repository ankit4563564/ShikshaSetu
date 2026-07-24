import type { ReactNode, SVGProps } from 'react';

type IconName = 'arrow' | 'play' | 'school' | 'family' | 'student' | 'check' | 'shield' | 'alert' | 'bus' | 'sparkles' | 'book';

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  play: <path d="m10 8 6 4-6 4V8Z" fill="currentColor" stroke="none" />,
  school: <><path d="m3 10 9-5 9 5-9 5-9-5Z" /><path d="M6 12v5h12v-5M10 14v3m4-3v3" /></>,
  family: <><circle cx="9" cy="8" r="2.5" /><circle cx="16" cy="9" r="2" /><path d="M4.5 19c.4-3 2-4.5 4.5-4.5s4.1 1.5 4.5 4.5M14 19c.2-2.1 1.2-3.4 3-3.4 1.6 0 2.5 1.1 2.8 3.4" /></>,
  student: <><circle cx="12" cy="8" r="3" /><path d="M5.5 20c.5-3.5 2.6-5.5 6.5-5.5s6 2 6.5 5.5" /></>,
  check: <path d="m5 12 4.2 4.2L19 6.8" />,
  shield: <path d="M12 3 19 6v5c0 4.8-2.8 8.2-7 10-4.2-1.8-7-5.2-7-10V6l7-3Zm-3 9 2 2 4-4" />,
  alert: <><path d="M12 3 21 19H3L12 3Z" /><path d="M12 9v4m0 3h.01" /></>,
  bus: <><path d="M6 17h12M7 17V7c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v10M5 11h14M9 8h2m2 0h2" /><circle cx="8" cy="18" r="1.5" /><circle cx="16" cy="18" r="1.5" /></>,
  sparkles: <><path d="m12 3 .9 4.1L17 8l-4.1.9L12 13l-.9-4.1L7 8l4.1-.9L12 3Zm6 10 .5 2.5L21 16l-2.5.5L18 19l-.5-2.5L15 16l2.5-.5L18 13ZM6 14l.6 2.4L9 17l-2.4.6L6 20l-.6-2.4L3 17l2.4-.6L6 14Z" /></>,
  book: <><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H18v15H7.5A2.5 2.5 0 0 0 5 20.5v-15Z" /><path d="M5 5.5V21m3-14h6" /></>,
};

export default function Icon({ name, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name]}</svg>;
}
