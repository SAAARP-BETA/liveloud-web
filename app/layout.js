import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My App',
  description: 'A basic Next.js app with Tailwind',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
