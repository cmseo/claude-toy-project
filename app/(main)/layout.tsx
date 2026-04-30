import { TabBar } from "@/components/diary/TabBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col pb-20">
      <main className="flex-1">{children}</main>
      <TabBar />
    </div>
  );
}
