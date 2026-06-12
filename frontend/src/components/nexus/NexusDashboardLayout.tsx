import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { NexusQueryProvider } from '@/components/nexus/NexusQueryProvider';
import { NexusSidebar } from '@/components/nexus/NexusSidebar';
import { NexusTopBar } from '@/components/nexus/NexusTopBar';

export default function NexusDashboardLayout() {
  return (
    <NexusQueryProvider>
      <SidebarProvider>
        <NexusSidebar />
        <SidebarInset>
          <NexusTopBar />
          <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </NexusQueryProvider>
  );
}
