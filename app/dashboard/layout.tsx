import { Sidebar } from "@/app/components/sidebar"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <aside className="hidden w-64 flex-col border-r bg-white md:flex">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}