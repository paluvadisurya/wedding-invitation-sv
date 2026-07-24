import { Confluence } from '@/components/confluence/Confluence';
import { site } from '@/config/site';

/**
 * The schedule renders "already happened" states, so the page is rebuilt
 * periodically rather than frozen at deploy time. Half an hour is far more
 * often than a wedding schedule changes, and costs nothing.
 */
export const revalidate = 1800;

export default function Page() {
  const now = new Date();

  return (
    <main id="main">{site.sections.confluence && <Confluence now={now} />}</main>
  );
}
