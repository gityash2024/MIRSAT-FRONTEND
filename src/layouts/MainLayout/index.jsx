// import { Outlet } from 'react-router-dom';
// import Sidebar from '../../components/common/Sidebar';

// const MainLayout = () => {
//   return (
//     <div className="flex">
//       <Sidebar />
//       <main className="flex-1 p-8 bg-gray-100 min-h-screen">
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default MainLayout;

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../layouts/SideBar';
import Topbar from '../../layouts/TopBar';

const LayoutWrapper = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: ${props => props.isSidebarOpen ? '240px' : '64px'};
  transition: margin 0.3s;
  min-height: 100vh;
  background-color: #f5f7fb;
`;

const PageContent = styled.div`
  margin-top: 64px;
  min-height: calc(100vh - 64px);
`;

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <LayoutWrapper>
      <Sidebar isOpen={isSidebarOpen} />
      <MainContent isSidebarOpen={isSidebarOpen}>
        <Topbar 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
        />
        <PageContent>
          <Outlet />
        </PageContent>
      </MainContent>
    </LayoutWrapper>
  );
};

export default MainLayout;

