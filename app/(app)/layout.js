import LeftSidebar from "@/Components/LeftSidebar";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <LeftSidebar />
        <main className="flex-1 ml-70 p-4">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
