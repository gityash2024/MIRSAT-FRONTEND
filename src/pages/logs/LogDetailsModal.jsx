import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  FileText,
  Image,
  MessageSquare,
  PenTool,
  Download,
  MapPin,
  Monitor,
  Globe,
  Database,
  Shield,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitBranch,
  ArrowRight,
  FileImage,
  Edit,
  Code,
  Settings
} from 'lucide-react';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-width: 1000px;
  width: 100%;
  height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, var(--color-teal) 0%, var(--color-navy) 100%);
  color: white;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
`;

const HeaderText = styled.div`
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  p {
    margin: 4px 0 0 0;
    opacity: 0.9;
    font-size: 14px;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  color: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const ModalBody = styled.div`
  padding: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0;
  flex: 1;
  overflow: hidden;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  padding: 24px;
  border-right: 1px solid var(--color-gray-light);
  overflow-y: auto;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid var(--color-gray-light);
  }
`;

const Sidebar = styled.div`
  background: #f8fafc;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
`;

const Section = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-gray-light);
`;

const DescriptionCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid var(--color-gray-light);
  border-radius: 12px;
  padding: 20px;
  font-size: 15px;
  line-height: 1.6;
  color: #475569;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(135deg, var(--color-teal) 0%, var(--color-navy) 100%);
    border-radius: 2px 0 0 2px;
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: white;
  border: 1px solid var(--color-gray-light);
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: var(--color-gray-medium);
  font-size: 13px;
  min-width: 120px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  color: var(--color-navy);
  font-size: 14px;
  text-align: right;
  word-break: break-word;
  max-width: 200px;
  font-weight: 500;
`;

const InfoCard = styled.div`
  background: white;
  border: 1px solid var(--color-gray-light);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: var(--color-gray-medium);
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: var(--color-navy);
  font-size: 14px;
  text-align: right;
  max-width: 200px;
  word-break: break-word;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.2px;
  background: ${props => {
    switch(props.type) {
      case 'task_started': return 'var(--color-info)';
      case 'task_completed': return 'var(--color-success)';
      case 'task_progress_updated': return 'var(--color-warning)';
      case 'task_archived': return 'var(--color-navy)';
      case 'questionnaire_completed': return '#8b5cf6';
      case 'task_signature_added': return '#06b6d4';
      case 'critical': return 'var(--color-error)';
      case 'high': return 'var(--color-warning)';
      case 'medium': return 'var(--color-info)';
      case 'low': return 'var(--color-success)';
      default: return 'var(--color-gray-medium)';
    }
  }};
  color: white;
  min-width: 80px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

// New styled components for enhanced details
const ChangeTracker = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
`;

const ChangeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--color-navy);
  font-weight: 600;
  font-size: 14px;
`;

const ChangeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ChangeLabel = styled.span`
  font-weight: 500;
  color: var(--color-gray-medium);
  min-width: 120px;
  font-size: 12px;
`;

const ChangeValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const PreviousValue = styled.span`
  background: #fef2f2;
  color: #dc2626;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-family: monospace;
  text-decoration: line-through;
`;

const NewValue = styled.span`
  background: #f0fdf4;
  color: #16a34a;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-family: monospace;
  font-weight: 600;
`;

const ArrowIcon = styled(ArrowRight)`
  color: var(--color-gray-medium);
  width: 16px;
  height: 16px;
`;

const MediaPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
`;

const MediaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const MediaIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.bgColor || '#f1f5f9'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const MediaInfo = styled.div`
  flex: 1;
`;

const MediaName = styled.div`
  font-weight: 500;
  color: var(--color-navy);
  font-size: 14px;
`;

const MediaSize = styled.div`
  color: var(--color-gray-medium);
  font-size: 12px;
`;

const PreviewButton = styled.button`
  background: var(--color-teal);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0d9488;
    transform: translateY(-1px);
  }
`;

const CodeBlock = styled.pre`
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  overflow-x: auto;
  margin: 8px 0;
`;

const ResponseSection = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
`;

const ResponseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0369a1;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
`;

const ResponseContent = styled.div`
  color: #0c4a6e;
  font-size: 12px;
  line-height: 1.5;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid var(--color-gray-light);
`;

const UserAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-teal) 0%, var(--color-navy) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 700;
  color: var(--color-navy);
  font-size: 18px;
  margin-bottom: 4px;
`;

const UserRole = styled.div`
  color: var(--color-gray-medium);
  font-size: 14px;
  margin-bottom: 2px;
  text-transform: capitalize;
`;

const UserEmail = styled.div`
  color: var(--color-gray-medium);
  font-size: 12px;
`;

const TaskCard = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 12px;
  border: 1px solid #bbf7d0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 2px 0 0 2px;
  }
`;

const TaskTitle = styled.div`
  font-weight: 700;
  color: var(--color-navy);
  font-size: 18px;
  margin-bottom: 12px;
`;

const TaskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: var(--color-gray-medium);
`;

const TaskInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskInfoLabel = styled.span`
  font-weight: 500;
  color: var(--color-gray-medium);
`;

const TaskInfoValue = styled.span`
  color: var(--color-navy);
  font-weight: 600;
  text-transform: capitalize;
`;

const TechnicalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0f9ff;
  border-radius: 8px;
  margin: 8px 0;
  border: 1px solid #bae6fd;
`;

const TechnicalIcon = styled.div`
  color: #0ea5e9;
`;

const TechnicalText = styled.div`
  flex: 1;
`;

const TechnicalLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #0c4a6e;
  margin-bottom: 2px;
`;

const TechnicalValue = styled.div`
  font-size: 12px;
  color: #0369a1;
`;

const CollapsibleSection = styled.div`
  margin-top: 16px;
`;

const CollapsibleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid var(--color-gray-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const CollapsibleTitle = styled.div`
  font-weight: 600;
  color: var(--color-navy);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CollapsibleContent = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  margin-top: 8px;
  padding: 16px;
  background: white;
  border: 1px solid var(--color-gray-light);
  border-radius: 8px;
  border-top: none;
`;

const LogDetailsModal = ({ log, isOpen, onClose }) => {
  const [showRawData, setShowRawData] = useState(false);
  const { t } = useTranslation();
  
  if (!isOpen || !log) return null;

  // Helper functions for enhanced details
  const formatValue = (value) => {
    if (value === null || value === undefined) return t('common.notAvailable');
    if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'string' && value.length > 100) return value.substring(0, 100) + '...';
    return String(value);
  };

  const getChangeItems = () => {
    const changes = [];
    const details = log.details || {};
    
    // Common change patterns
    if (details.previousStatus && details.currentStatus) {
      changes.push({
        label: t('common.status'),
        previous: details.previousStatus,
        current: details.currentStatus
      });
    }
    
    if (details.previousPriority && details.currentPriority) {
      changes.push({
        label: t('common.priority'),
        previous: details.previousPriority,
        current: details.currentPriority
      });
    }
    
    if (details.oldValue && details.newValue) {
      changes.push({
        label: t('logs.value'),
        previous: details.oldValue,
        current: details.newValue
      });
    }
    
    if (details.previousAnswer && details.newAnswer) {
      changes.push({
        label: t('logs.answer'),
        previous: details.previousAnswer,
        current: details.newAnswer
      });
    }
    
    if (details.previousProgress && details.currentProgress) {
      changes.push({
        label: t('logs.progress'),
        previous: `${details.previousProgress}%`,
        current: `${details.currentProgress}%`
      });
    }
    
    return changes;
  };

  const getMediaItems = () => {
    const media = [];
    const details = log.details || {};
    
    // Check for images
    if (details.imageUrl || details.image) {
      media.push({
        type: 'image',
        name: details.imageName || t('logs.image'),
        url: details.imageUrl || details.image,
        size: details.imageSize || t('logs.unknownSize'),
        icon: FileImage,
        bgColor: '#3b82f6'
      });
    }
    
    // Check for signatures
    if (details.signatureUrl || details.signature) {
      media.push({
        type: 'signature',
        name: details.signatureName || t('logs.signature'),
        url: details.signatureUrl || details.signature,
        size: details.signatureSize || t('logs.unknownSize'),
        icon: Edit,
        bgColor: '#8b5cf6'
      });
    }
    
    // Check for attachments
    if (details.attachments && Array.isArray(details.attachments)) {
      details.attachments.forEach((attachment, index) => {
        media.push({
          type: 'attachment',
          name: attachment.name || `Attachment ${index + 1}`,
          url: attachment.url,
          size: attachment.size || t('logs.unknownSize'),
          icon: FileText,
          bgColor: '#10b981'
        });
      });
    }
    
    return media;
  };

  const getResponseData = () => {
    const details = log.details || {};
    
    if (details.response) {
      return {
        status: details.responseStatus || t('logs.success'),
        data: details.response,
        timestamp: details.responseTimestamp || log.timestamp
      };
    }
    
    return null;
  };

  const getSystemInfo = () => {
    return {
      ipAddress: log.ipAddress || t('logs.unknown'),
      userAgent: log.userAgent || t('logs.unknown'),
      timestamp: log.timestamp,
      module: log.module,
      action: log.action,
      severity: log.severity
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionIcon = (action) => {
    if (action.includes('started')) return <CheckCircle size={20} />;
    if (action.includes('completed')) return <CheckCircle size={20} />;
    if (action.includes('progress')) return <Activity size={20} />;
    if (action.includes('archived')) return <XCircle size={20} />;
    if (action.includes('questionnaire')) return <FileText size={20} />;
    if (action.includes('comment')) return <MessageSquare size={20} />;
    if (action.includes('attachment')) return <Image size={20} />;
    if (action.includes('signature')) return <PenTool size={20} />;
    return <Info size={20} />;
  };

  const getIPLocation = (ip) => {
    if (ip === '127.0.0.1' || ip === '::1') return t('logs.localDevelopment');
    if (ip?.startsWith('192.168.')) return t('logs.localNetwork');
    if (ip?.startsWith('10.')) return t('logs.privateNetwork');
    return t('logs.unknownLocation');
  };

  const getDeviceInfo = (userAgent) => {
    if (!userAgent) return t('logs.unknownDevice');
    
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isWindows = /Windows/.test(userAgent);
    const isMac = /Mac/.test(userAgent);
    const isLinux = /Linux/.test(userAgent);
    
    if (isMobile) return t('logs.mobileDevice');
    if (isWindows) return t('logs.windowsPC');
    if (isMac) return t('logs.macComputer');
    if (isLinux) return t('logs.linuxComputer');
    return t('logs.unknownDevice');
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderContent>
            <ActionIcon>
              {getActionIcon(log.action)}
            </ActionIcon>
            <HeaderText>
              <h2>{formatAction(log.action)}</h2>
              <p>{log.description}</p>
            </HeaderText>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <ContentGrid>
            <MainContent>
              <Section>
                <SectionTitle>
                  <FileText size={20} />
                  {t('logs.activityDetails')}
                </SectionTitle>
                <DescriptionCard>
                  {log.description}
                </DescriptionCard>
              </Section>

              {(() => {
                // Check if there are any valid fields after filtering
                const validFields = Object.entries(log.details || {})
                  .filter(([key, value]) => {
                    // Filter out technical fields that are not user-friendly
                    const technicalFields = ['subLevelId', 'field', 'oldValue', 'newValue', 'timeSpent'];
                    return !technicalFields.includes(key) && value !== null && value !== undefined && value !== '';
                  });
                
                // Only show section if there are valid fields
                if (validFields.length === 0) return null;
                
                return (
                  <>
                    {/* Change Tracking Section */}
                    {getChangeItems().length > 0 && (
                      <ChangeTracker>
                        <ChangeHeader>
                          <GitBranch size={16} />
                          {t('logs.changeHistory')}
                        </ChangeHeader>
                        {getChangeItems().map((change, index) => (
                          <ChangeItem key={index}>
                            <ChangeLabel>{change.label}</ChangeLabel>
                            <ChangeValue>
                              <PreviousValue>{change.previous}</PreviousValue>
                              <ArrowIcon size={16} />
                              <NewValue>{change.current}</NewValue>
                            </ChangeValue>
                          </ChangeItem>
                        ))}
                      </ChangeTracker>
                    )}

                    {/* Media Preview Section */}
                    {getMediaItems().length > 0 && (
                      <MediaPreview>
                        <ChangeHeader>
                          <Image size={16} />
                          {t('logs.mediaAttachments')}
                        </ChangeHeader>
                        {getMediaItems().map((item, index) => (
                          <MediaItem key={index}>
                            <MediaIcon bgColor={item.bgColor}>
                              <item.icon size={20} />
                            </MediaIcon>
                            <MediaInfo>
                              <MediaName>{item.name}</MediaName>
                              <MediaSize>{item.size}</MediaSize>
                            </MediaInfo>
                            <PreviewButton onClick={() => window.open(item.url, '_blank')}>
                              <Eye size={14} />
                              {t('logs.preview')}
                            </PreviewButton>
                          </MediaItem>
                        ))}
                      </MediaPreview>
                    )}

                    {/* Response Data Section */}
                    {getResponseData() && (
                      <ResponseSection>
                        <ResponseHeader>
                          <Code size={16} />
                          {t('logs.apiResponse')}
                        </ResponseHeader>
                        <ResponseContent>
                          <div><strong>{t('common.status')}:</strong> {getResponseData().status}</div>
                          <div><strong>{t('common.timestamp')}:</strong> {formatDate(getResponseData().timestamp)}</div>
                          <CodeBlock>{JSON.stringify(getResponseData().data, null, 2)}</CodeBlock>
                        </ResponseContent>
                      </ResponseSection>
                    )}

                    {/* System Information */}
                    <Section>
                      <SectionTitle>
                        <Settings size={20} />
                        {t('logs.systemInformation')}
                      </SectionTitle>
                      <DetailsGrid>
                        <DetailItem>
                          <DetailLabel>IP Address</DetailLabel>
                          <DetailValue>{getSystemInfo().ipAddress}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>{t('logs.userAgent')}</DetailLabel>
                          <DetailValue>{getSystemInfo().userAgent}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>{t('logs.module')}</DetailLabel>
                          <DetailValue>{getSystemInfo().module}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>{t('logs.action')}</DetailLabel>
                          <DetailValue>{getSystemInfo().action}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>{t('logs.severity')}</DetailLabel>
                          <DetailValue>
                            <Badge type={getSystemInfo().severity}>
                              {getSystemInfo().severity}
                            </Badge>
                          </DetailValue>
                        </DetailItem>
                      </DetailsGrid>
                    </Section>

                    {/* Raw Data Toggle */}
                    <Section>
                      <SectionTitle>
                        <Database size={20} />
                        {t('logs.rawData')}
                        <button 
                          onClick={() => setShowRawData(!showRawData)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            marginLeft: 'auto',
                            color: 'var(--color-teal)'
                          }}
                        >
                          {showRawData ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </SectionTitle>
                      {showRawData && (
                        <CodeBlock>{JSON.stringify(log, null, 2)}</CodeBlock>
                      )}
                    </Section>
                  </>
                );
              })()}

              {log.userId && (
                <Section>
                  <SectionTitle>
                    <User size={20} />
                    {t('logs.userInformation')}
                  </SectionTitle>
                  <UserCard>
                    <UserAvatar>
                      {log.userId.name?.charAt(0)?.toUpperCase() || 'U'}
                    </UserAvatar>
                    <UserInfo>
                      <UserName>{log.userId.name || 'Unknown User'}</UserName>
                      <UserRole>{log.userId.role || 'Unknown Role'}</UserRole>
                      <UserEmail>{log.userId.email || 'No email'}</UserEmail>
                    </UserInfo>
                  </UserCard>
                </Section>
              )}

              {log.taskId && (
                <Section>
                  <SectionTitle>
                    <FileText size={20} />
                    {t('logs.taskInformation')}
                  </SectionTitle>
                  <TaskCard>
                    <TaskTitle>{log.taskId.title || 'Unknown Task'}</TaskTitle>
                    <TaskInfo>
                      <TaskInfoRow>
                        <TaskInfoLabel>{t('common.status')}:</TaskInfoLabel>
                        <TaskInfoValue>{log.taskId.status || 'Unknown'}</TaskInfoValue>
                      </TaskInfoRow>
                      <TaskInfoRow>
                        <TaskInfoLabel>{t('common.priority')}:</TaskInfoLabel>
                        <TaskInfoValue>{log.taskId.priority || 'Unknown'}</TaskInfoValue>
                      </TaskInfoRow>
                      {log.taskId.deadline && (
                        <TaskInfoRow>
                          <TaskInfoLabel>{t('calendar.deadline')}:</TaskInfoLabel>
                          <TaskInfoValue>{formatDate(log.taskId.deadline)}</TaskInfoValue>
                        </TaskInfoRow>
                      )}
                    </TaskInfo>
                  </TaskCard>
                </Section>
              )}
            </MainContent>

            <Sidebar>
              <InfoCard>
                <CardTitle>
                  <Info size={18} />
                  {t('logs.logInformation')}
                </CardTitle>
                <InfoRow>
                  <InfoLabel>{t('logs.action')}</InfoLabel>
                  <Badge type={log.action}>
                    {formatAction(log.action)}
                  </Badge>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>{t('logs.module')}</InfoLabel>
                  <InfoValue style={{ textTransform: 'capitalize' }}>
                    {log.module?.replace('_', ' ')}
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>{t('logs.severity')}</InfoLabel>
                  <Badge type={log.severity}>
                    {log.severity}
                  </Badge>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>{t('common.timestamp')}</InfoLabel>
                  <InfoValue>{formatDate(log.timestamp)}</InfoValue>
                </InfoRow>
              </InfoCard>

              <InfoCard>
                <CardTitle>
                  <Monitor size={18} />
                  {t('logs.technicalDetails')}
                </CardTitle>
                
                {log.ipAddress && (
                  <TechnicalInfo>
                    <TechnicalIcon>
                      <Globe size={16} />
                    </TechnicalIcon>
                    <TechnicalText>
                      <TechnicalLabel>IP Address</TechnicalLabel>
                      <TechnicalValue>
                        {log.ipAddress} • {getIPLocation(log.ipAddress)}
                      </TechnicalValue>
                    </TechnicalText>
                  </TechnicalInfo>
                )}

                {log.userAgent && (
                  <TechnicalInfo>
                    <TechnicalIcon>
                      <Monitor size={16} />
                    </TechnicalIcon>
                    <TechnicalText>
                      <TechnicalLabel>{t('logs.device')}</TechnicalLabel>
                      <TechnicalValue>
                        {getDeviceInfo(log.userAgent)}
                      </TechnicalValue>
                    </TechnicalText>
                  </TechnicalInfo>
                )}

                <InfoRow>
                  <InfoLabel>{t('logs.logId')}</InfoLabel>
                  <InfoValue style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                    {log._id}
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>{t('logs.createdAt')}</InfoLabel>
                  <InfoValue>{formatDate(log.createdAt)}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>{t('logs.updatedAt')}</InfoLabel>
                  <InfoValue>{formatDate(log.updatedAt)}</InfoValue>
                </InfoRow>
              </InfoCard>
            </Sidebar>
          </ContentGrid>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default LogDetailsModal;
