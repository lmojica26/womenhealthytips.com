import { AffiliateSidebar } from "@/components/affiliates/sidebar-widget";

interface ContentWithSidebarProps {
  children: React.ReactNode;
  showAffiliateSidebar?: boolean;
  sidebarContent?: React.ReactNode;
}

export function ContentWithSidebar({
  children,
  showAffiliateSidebar = true,
  sidebarContent,
}: ContentWithSidebarProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">{children}</div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {sidebarContent}
          {showAffiliateSidebar && <AffiliateSidebar />}
        </aside>
      </div>
    </div>
  );
}
