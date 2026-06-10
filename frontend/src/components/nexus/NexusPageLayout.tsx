import type { ReactNode } from 'react';
import { NexusServiceHeader } from './NexusServiceHeader';

type Props = {
  title: string;
  children: ReactNode;
};

export function NexusPageLayout({ title, children }: Props) {
  return (
    <div className="app-shell flex min-h-screen flex-col px-4 py-10 sm:px-6">
      <NexusServiceHeader title={title} />
      <main className="flex w-full flex-1 flex-col">{children}</main>
    </div>
  );
}
