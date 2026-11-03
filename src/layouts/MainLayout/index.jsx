import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../TopBar';
import { useLanguage } from '../../context/LanguageContext';
import { isCompactViewport } from '../../utils/layout';
import LegalLinks from '../../components/common/LegalLinks';

// const AgentWidget = lazy(() => import('../../components/assistant/AgentWidget'));

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  min-width: 0;
  background-color: ${props => props.$pageBackground};
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
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s, visibility 0.3s;
  
  @media (max-width: 1100px) {
    display: block;
  }
`;

const MainContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  ${props => props.$isRTL 
    ? `margin-right: ${props.$sidebarWidth}px;`
    : `margin-left: ${props.$sidebarWidth}px;`
  }
  transition: ${props => props.$isRTL ? 'margin-right' : 'margin-left'} 0.3s ease;
  
  @media (max-width: 1100px) {
    margin-left: 0;
    margin-right: 0;
  }
`;

const MainContent = styled.div`
  padding: 80px 24px 24px;
  min-height: calc(100vh - 64px);
  min-width: 0;
  max-width: 100%;

  > * {
    min-width: 0;
    max-width: 100%;
  }
  
  @media (max-width: 1100px) {
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
    return isSidebarOpen ? 297 : 70;
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = isCompactViewport(window.innerWidth);
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
    <LayoutContainer $pageBackground={location.pathname.startsWith("/assets") ? "#F6F7F9" : /^\/(documents|fault-reports|spare-parts)/.test(location.pathname) ? "#F5FAFF" : "#f5f7fb"}>
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        className="sidebar"
      />
      {isMobile && (
        <Overlay 
          $isVisible={isSidebarOpen}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <MainContentWrapper $sidebarWidth={getSidebarWidth()} $isRTL={isRTL}>
        <Topbar 
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <MainContent>
          <Outlet />
          <footer style={{ marginTop: 24, paddingTop: 16, color: '#475569' }}>
            <LegalLinks centered />
          </footer>
        </MainContent>
      </MainContentWrapper>
      {/* <Suspense fallback={null}>
        <AgentWidget />
      </Suspense> */}
    </LayoutContainer>
  );
};

export default MainLayout;
