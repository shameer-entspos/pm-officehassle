import AppSidebar from '@/components/app/sidebar/appSidebar';
import SidebarInset from '@/components/app/sidebarInset/sidebarInset';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scrollbar-none flex h-screen justify-between overflow-auto">
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </div>
  );
}
