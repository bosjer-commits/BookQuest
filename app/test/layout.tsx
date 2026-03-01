import { ReactNode } from 'react';
import { DemoUserProvider } from '@/contexts/demo/DemoUserContext';
import DemoUserDataProviders from '@/components/DemoUserDataProviders';

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <DemoUserProvider>
      <DemoUserDataProviders>{children}</DemoUserDataProviders>
    </DemoUserProvider>
  );
}
