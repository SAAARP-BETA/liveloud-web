import { AuthProvider } from '@/app/context/AuthContext';
import { ModalProvider } from '@/app/context/ModalContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { SocketProvider } from '@/app/context/SocketContext';
import './globals.css';
import ThemeToggle from './components/common/ThemeToggle';

export const metadata = {
  title: 'LiveLoud'
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white dark:bg-gray-900 text-black dark:text-white">
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
            <ThemeToggle/>
            <ModalProvider>
              {children}
              <Toaster position="top-right" />
            </ModalProvider>
             </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}