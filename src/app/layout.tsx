import type { Metadata, Viewport } from 'next';
import { site } from '@/config/site';
import { Reveal, motionBootstrap } from '@/components/motion/Reveal';
import { display, text } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.title} — 26 August 2026`,
    template: `%s — ${site.title}`,
  },
  description: site.description,
  robots: site.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  openGraph: {
    type: 'website',
    title: `${site.title} — 26 August 2026`,
    description: site.description,
    siteName: site.title,
  },
  formatDetection: { telephone: true, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: '#edefe9',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${text.variable}`}
      /* The pre-paint script below sets data-motion on this element, which React
         cannot know about at hydration time. This is the intended pattern. */
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint, so content is never briefly visible and
            then hidden. Omitted entirely for guests who prefer reduced motion. */}
        <script dangerouslySetInnerHTML={{ __html: motionBootstrap }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to the invitation
        </a>
        {children}
        <Reveal />
      </body>
    </html>
  );
}
