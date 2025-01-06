import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-100 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;