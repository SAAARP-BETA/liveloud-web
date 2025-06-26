import LeftSidebar from '../../../components/LeftSidebar';
export default function HomeLayout({ children }) {
  return (
    <div className="flex h-screen">
      {children}     
      
    </div>
  );
}