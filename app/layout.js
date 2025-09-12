// app/layout.js or app/layout.jsx
import { AuthProvider } from '@/app/context/AuthContext';
import { ModalProvider } from '@/app/context/ModalContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/app/context/ThemeContext';

import './globals.css';

export const metadata = {
  title: 'LiveLoud'
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white dark:bg-gray-900 text-black dark:text-white">
        <ThemeProvider>
          <AuthProvider>
            <ModalProvider>
              {children}
              <Toaster position="top-right" />
            </ModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}