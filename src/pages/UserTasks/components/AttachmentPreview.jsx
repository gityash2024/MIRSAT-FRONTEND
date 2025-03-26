import React, { useState } from 'react';
import styled from 'styled-components';
import { File, Image, X, ExternalLink, Download } from 'lucide-react';

const AttachmentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  background: rgba(248, 250, 252, 0.7);
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(226, 232, 240, 0.7);
  
  &:hover {
    background: rgba(248, 250, 252, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const AttachmentIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.isImage ? '#e3f2fd' : '#f8fafc'};
  color: ${props => props.isImage ? '#0277bd' : '#475569'};
  margin-right: 12px;
  flex-shrink: 0;
`;

const AttachmentName = styled.div`
  font-size: 14px;
  color: #475569;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AttachmentActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.7);
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LightboxImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const NoAttachmentsMessage = styled.div`
  color: #64748b;
  font-size: 14px;
  text-align: center;
  padding: 12px;
  background: rgba(248, 250, 252, 0.4);
  border-radius: 8px;
  border: 1px dashed rgba(203, 213, 225, 0.8);
`;

const AttachmentPreview = ({ attachments = [] }) => {
  const [activeImage, setActiveImage] = useState(null);
  
  const isImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = url.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };
  
  const getAttachmentName = (url) => {
    if (!url) return 'Unnamed file';
    return url.split('/').pop();
  };
  
  const handleDownload = (url) => {
    if (!url) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = getAttachmentName(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!attachments || attachments.length === 0) {
    return <NoAttachmentsMessage>No attachments available</NoAttachmentsMessage>;
  }
  
  return (
    <AttachmentsContainer>
      {attachments.map((attachment, index) => {
        const url = typeof attachment === 'string' ? attachment : attachment.url;
        const name = typeof attachment === 'string' ? getAttachmentName(url) : (attachment.filename || getAttachmentName(url));
        const isImage = isImageUrl(url);
        
        return (
          <AttachmentItem key={index}>
            <AttachmentIcon isImage={isImage}>
              {isImage ? <Image size={18} /> : <File size={18} />}
            </AttachmentIcon>
            <AttachmentName>{name}</AttachmentName>
            <AttachmentActions>
              {isImage && (
                <ActionButton onClick={() => setActiveImage(url)} title="Preview">
                  <ExternalLink size={14} />
                </ActionButton>
              )}
              <ActionButton onClick={() => handleDownload(url)} title="Download">
                <Download size={14} />
              </ActionButton>
            </AttachmentActions>
          </AttachmentItem>
        );
      })}
      
      {activeImage && (
        <LightboxOverlay onClick={() => setActiveImage(null)}>
          <LightboxImage 
            src={activeImage} 
            alt="Attachment preview" 
            onClick={(e) => e.stopPropagation()}
          />
          <CloseButton onClick={() => setActiveImage(null)}>
            <X size={20} />
          </CloseButton>
        </LightboxOverlay>
      )}
    </AttachmentsContainer>
  );
};

export default AttachmentPreview;