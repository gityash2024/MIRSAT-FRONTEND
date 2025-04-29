import React, { createContext, useState, useContext, useCallback } from 'react';
import styled from 'styled-components';

// Create the context
const LoadingContext = createContext();

// Styled components for loading indicator
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.transparent ? 'transparent' : 'rgba(255, 255, 255, 0.7)'};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  pointer-events: ${props => props.blockInteraction ? 'auto' : 'none'};
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(26, 35, 126, 0.2);
  border-radius: 50%;
  border-top-color: var(--color-navy);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingMessage = styled.div`
  margin-top: 16px;
  color: var(--color-navy);
  font-weight: 500;
`;

// Provider component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [blockInteraction, setBlockInteraction] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(null);
  const [transparent, setTransparent] = useState(false);
  
  // Start loading with optional message and timeout
  const startLoading = useCallback((newMessage = '', options = {}) => {
    const { 
      timeout = 15000, 
      blockInteraction = true, 
      showDelay = 300,
      transparent = false 
    } = options;
    
    setMessage(newMessage);
    setBlockInteraction(blockInteraction);
    setTransparent(transparent);
    
    // Clear any existing timeouts
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    if (showLoadingTimeout) {
      clearTimeout(showLoadingTimeout);
    }
    
    // Only show loading indicator after delay (prevents flashing for quick operations)
    const newShowTimeout = setTimeout(() => {
      setIsLoading(true);
    }, showDelay);
    
    setShowLoadingTimeout(newShowTimeout);
    
    // Set a new timeout to automatically stop loading after specified duration
    const newTimeout = setTimeout(() => {
      setIsLoading(false);
      console.log('Loading automatically stopped after timeout');
    }, timeout);
    
    setLoadingTimeout(newTimeout);
  }, [loadingTimeout, showLoadingTimeout]);
  
  // Stop loading
  const stopLoading = useCallback(() => {
    // Clear show loading timeout to prevent it from appearing after
    if (showLoadingTimeout) {
      clearTimeout(showLoadingTimeout);
      setShowLoadingTimeout(null);
    }
    
    setIsLoading(false);
    setMessage('');
    
    // Clear timeout if exists
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  }, [loadingTimeout, showLoadingTimeout]);
  
  // Update loading message
  const updateLoadingMessage = useCallback((newMessage) => {
    setMessage(newMessage);
  }, []);
  
  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      if (showLoadingTimeout) {
        clearTimeout(showLoadingTimeout);
      }
    };
  }, [loadingTimeout, showLoadingTimeout]);
  
  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      startLoading, 
      stopLoading, 
      updateLoadingMessage 
    }}>
      {children}
      
      {isLoading && (
        <LoadingOverlay 
          blockInteraction={blockInteraction} 
          transparent={transparent}
        >
          <div style={{ textAlign: 'center' }}>
            <Spinner />
            {message && <LoadingMessage>{message}</LoadingMessage>}
          </div>
        </LoadingOverlay>
      )}
    </LoadingContext.Provider>
  );
};

// Custom hook to use the loading context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext; 