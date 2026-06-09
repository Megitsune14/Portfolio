import type { ReactNode } from 'react';
import { GoalsNav } from './GoalsNav';

type Props = {
  children: ReactNode;
};

export function GoalsPageLayout({ children }: Props) {
  return (
    <div className="app-shell flex min-h-screen flex-col px-4 py-10 sm:px-6">
      <GoalsNav />
      <main className="flex w-full flex-1 flex-col">{children}</main>
    </div>
  );
}
