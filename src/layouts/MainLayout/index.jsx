import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../TopBar';
import { useLanguage } from '../../context/LanguageContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  background-color: #f5f7fb;
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s, visibility 0.3s;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MainContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  ${props => props.$isRTL 
    ? `margin-right: ${props.sidebarWidth}px;` 
    : `margin-left: ${props.sidebarWidth}px;`
  }
  transition: ${props => props.$isRTL ? 'margin-right' : 'margin-left'} 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-right: 0;
  }
`;

const MainContent = styled.div`
  padding: 80px 24px 24px;
  min-height: calc(100vh - 64px);
  max-width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 80px 16px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 80px 12px 12px;
  }
`;

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { isRTL } = useLanguage();

  console.log("MainLayout rendering, path:", location.pathname);
  
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    return isSidebarOpen ? 280 : 70;
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isSidebarOpen]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = (event) => {
    if (event) event.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        className="sidebar"
      />
      {isMobile && (
        <Overlay 
          isVisible={isSidebarOpen} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <MainContentWrapper sidebarWidth={getSidebarWidth()} $isRTL={isRTL}>
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