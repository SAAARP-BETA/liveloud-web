// app/layout.js or app/layout.jsx
import { AuthProvider } from '@/app/context/AuthContext';
import { ModalProvider } from '@/app/context/ModalContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'LiveLoud'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black">
        <AuthProvider>
          <ModalProvider>
            {children}
            <Toaster position="top-right" />
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}