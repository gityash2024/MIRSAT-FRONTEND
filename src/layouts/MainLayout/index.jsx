import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../TopBar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  background-color: #f5f7fb;
`;

const MainContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  margin-left: ${props => props.sidebarWidth}px;
  transition: margin-left 0.3s ease;
`;

const MainContent = styled.div`
  padding: 80px 24px 24px;
  min-height: calc(100vh - 64px);
  max-width: 100%;
  overflow-x: hidden;
`;

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarWidth = isSidebarOpen ? 240 : 64;
  const location = useLocation();

  console.log("MainLayout rendering, path:", location.pathname);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isSidebarOpen && !event.target.closest('.sidebar')) {
        setIsSidebarOpen(true);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const toggleSidebar = (event) => {
    event.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar 
        isOpen={isSidebarOpen} 
        width={sidebarWidth}
        className="sidebar"
      />
      <MainContentWrapper sidebarWidth={sidebarWidth}>
        <Topbar 
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <MainContent>
          <Outlet />
        </MainContent>
      </MainContentWrapper>
    </LayoutContainer>
  );
};

export default MainLayout;