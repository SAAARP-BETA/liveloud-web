import AuthRoute from "@/app/components/AuthRoute";

export default function AuthLayout({ children }) {
  return (
    <AuthRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </AuthRoute>
  );
}
