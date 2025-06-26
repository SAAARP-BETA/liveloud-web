import './globals.css';

export const metadata = {
  title: 'App',
  description: 'Navbar',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black">
        {children}
      </body>
    </html>
  );
}
