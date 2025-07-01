import LeftSidebar from "@/components/LeftSidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex">
      <LeftSidebar />
      <main className="flex-1 lg:ml-70 p-4">{children}</main>
    </div>
  );
}
