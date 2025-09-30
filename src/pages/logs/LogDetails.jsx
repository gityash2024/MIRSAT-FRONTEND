import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
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
  ChevronUp
} from 'lucide-react';
import { API_CONFIG } from '../../config/api';

const LogDetailsContainer = styled.div`
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
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
  color: #64748b;
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: #1e293b;
  font-size: 14px;
  text-align: right;
  max-width: 200px;
  word-break: break-word;
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => {
    switch(props.type) {
      case 'task_started': return '#dbeafe';
      case 'task_completed': return '#dcfce7';
      case 'task_progress_updated': return '#fef3c7';
      case 'task_archived': return '#e0e7ff';
      case 'questionnaire_completed': return '#fce7f3';
      case 'critical': return '#fef2f2';
      case 'high': return '#fef3c7';
      case 'medium': return '#dbeafe';
      case 'low': return '#f0fdf4';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'task_started': return '#1e40af';
      case 'task_completed': return '#166534';
      case 'task_progress_updated': return '#92400e';
      case 'task_archived': return '#3730a3';
      case 'questionnaire_completed': return '#be185d';
      case 'critical': return '#dc2626';
      case 'high': return '#d97706';
      case 'medium': return '#2563eb';
      case 'low': return '#16a34a';
      default: '#374151';
    }
  }};
`;

const Description = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
`;

const DetailsSection = styled.div`
  margin-top: 24px;
`;

const DetailsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const DetailsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #64748b;
  font-size: 13px;
  min-width: 120px;
`;

const DetailValue = styled.span`
  color: #1e293b;
  font-size: 13px;
  text-align: right;
  word-break: break-word;
  max-width: 200px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
  margin-bottom: 4px;
`;

const UserRole = styled.div`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  color: #64748b;
  font-size: 12px;
`;

const TaskCard = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #10b981;
`;

const TaskTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
  margin-bottom: 8px;
`;

const TaskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #64748b;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #dc2626;
`;

const MetadataSection = styled.div`
  margin-top: 24px;
`;

const MetadataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CollapsibleSection = styled.div`
  margin-top: 16px;
`;

const CollapsibleContent = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  margin-top: 12px;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const IPInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  margin: 8px 0;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0fdf4;
  border-radius: 6px;
  margin: 8px 0;
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 6px;
  margin: 8px 0;
`;

const LogDetails = () => {
  const { logId } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    metadata: false,
    technical: false
  });

  useEffect(() => {
    fetchLogDetails();
  }, [logId]);

  const fetchLogDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/logs/${logId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch log details');
      }

      const data = await response.json();
      setLog(data.data);
    } catch (error) {
      console.error('Error fetching log details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionIcon = (action) => {
    if (action.includes('started')) return <CheckCircle size={16} />;
    if (action.includes('completed')) return <CheckCircle size={16} />;
    if (action.includes('progress')) return <Activity size={16} />;
    if (action.includes('archived')) return <XCircle size={16} />;
    if (action.includes('questionnaire')) return <FileText size={16} />;
    if (action.includes('comment')) return <MessageSquare size={16} />;
    if (action.includes('attachment')) return <Image size={16} />;
    if (action.includes('signature')) return <PenTool size={16} />;
    return <Info size={16} />;
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return <AlertCircle size={16} style={{ color: '#dc2626' }} />;
      case 'high': return <AlertCircle size={16} style={{ color: '#d97706' }} />;
      case 'medium': return <Info size={16} style={{ color: '#2563eb' }} />;
      case 'low': return <CheckCircle size={16} style={{ color: '#16a34a' }} />;
      default: return <Info size={16} />;
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getIPLocation = (ip) => {
    // This is a mock function - in real implementation, you'd use a geolocation API
    if (ip === '127.0.0.1' || ip === '::1') return 'Local Development';
    if (ip?.startsWith('192.168.')) return 'Local Network';
    if (ip?.startsWith('10.')) return 'Private Network';
    return 'Unknown Location';
  };

  const getDeviceInfo = (userAgent) => {
    if (!userAgent) return 'Unknown Device';
    
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isWindows = /Windows/.test(userAgent);
    const isMac = /Mac/.test(userAgent);
    const isLinux = /Linux/.test(userAgent);
    
    if (isMobile) return 'Mobile Device';
    if (isWindows) return 'Windows PC';
    if (isMac) return 'Mac Computer';
    if (isLinux) return 'Linux Computer';
    return 'Unknown Device';
  };

  if (loading) {
    return (
      <LogDetailsContainer>
        <LoadingSpinner>
          <Activity className="animate-spin" size={24} />
          <span style={{ marginLeft: '8px' }}>Loading log details...</span>
        </LoadingSpinner>
      </LogDetailsContainer>
    );
  }

  if (error) {
    return (
      <LogDetailsContainer>
        <ErrorMessage>
          <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div>Error loading log details</div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>{error}</div>
        </ErrorMessage>
      </LogDetailsContainer>
    );
  }

  if (!log) {
    return (
      <LogDetailsContainer>
        <ErrorMessage>
          <Info size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div>Log not found</div>
        </ErrorMessage>
      </LogDetailsContainer>
    );
  }

  return (
    <LogDetailsContainer>
      <Header>
        <BackButton onClick={() => navigate('/logs')}>
          <ArrowLeft size={16} />
          Back to Logs
        </BackButton>
        <Title>Log Details</Title>
      </Header>

      <Content>
        <MainContent>
          <CardTitle>
            {getActionIcon(log.action)}
            {formatAction(log.action)}
          </CardTitle>
          
          <Description>
            {log.description}
          </Description>

          {log.details && Object.keys(log.details).length > 0 && (
            <DetailsSection>
              <DetailsTitle onClick={() => toggleSection('details')}>
                <FileText size={16} />
                Activity Details
                <ExpandButton>
                  {expandedSections.details ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </ExpandButton>
              </DetailsTitle>
              <CollapsibleContent isOpen={expandedSections.details}>
                <DetailsGrid>
                  {Object.entries(log.details).map(([key, value]) => (
                    <DetailItem key={key}>
                      <DetailLabel>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</DetailLabel>
                      <DetailValue>
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </DetailValue>
                    </DetailItem>
                  ))}
                </DetailsGrid>
              </CollapsibleContent>
            </DetailsSection>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <MetadataSection>
              <DetailsTitle onClick={() => toggleSection('metadata')}>
                <Database size={16} />
                Additional Information
                <ExpandButton>
                  {expandedSections.metadata ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </ExpandButton>
              </DetailsTitle>
              <CollapsibleContent isOpen={expandedSections.metadata}>
                <DetailsGrid>
                  {Object.entries(log.metadata).map(([key, value]) => (
                    <DetailItem key={key}>
                      <DetailLabel>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</DetailLabel>
                      <DetailValue>
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </DetailValue>
                    </DetailItem>
                  ))}
                </DetailsGrid>
              </CollapsibleContent>
            </MetadataSection>
          )}
        </MainContent>

        <Sidebar>
          <InfoCard>
            <CardTitle>
              <Info size={18} />
              Log Information
            </CardTitle>
            <InfoRow>
              <InfoLabel>Action</InfoLabel>
              <Badge type={log.action}>
                {formatAction(log.action)}
              </Badge>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Module</InfoLabel>
              <InfoValue style={{ textTransform: 'capitalize' }}>
                {log.module?.replace('_', ' ')}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Severity</InfoLabel>
              <Badge type={log.severity}>
                {log.severity}
              </Badge>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Timestamp</InfoLabel>
              <InfoValue>{formatDate(log.timestamp)}</InfoValue>
            </InfoRow>
          </InfoCard>

          {log.userId && (
            <InfoCard>
              <CardTitle>
                <User size={18} />
                User Information
              </CardTitle>
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
            </InfoCard>
          )}

          {log.taskId && (
            <InfoCard>
              <CardTitle>
                <FileText size={18} />
                Task Information
              </CardTitle>
              <TaskCard>
                <TaskTitle>{log.taskId.title || 'Unknown Task'}</TaskTitle>
                <TaskInfo>
                  <div>Status: {log.taskId.status || 'Unknown'}</div>
                  <div>Priority: {log.taskId.priority || 'Unknown'}</div>
                  {log.taskId.deadline && (
                    <div>Deadline: {formatDate(log.taskId.deadline)}</div>
                  )}
                </TaskInfo>
              </TaskCard>
            </InfoCard>
          )}

          <InfoCard>
            <CardTitle>
              <Monitor size={18} />
              Technical Details
            </CardTitle>
            
            {log.ipAddress && (
              <IPInfo>
                <Globe size={16} />
                <div>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>IP Address</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {log.ipAddress} • {getIPLocation(log.ipAddress)}
                  </div>
                </div>
              </IPInfo>
            )}

            {log.userAgent && (
              <DeviceInfo>
                <Monitor size={16} />
                <div>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>Device</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {getDeviceInfo(log.userAgent)}
                  </div>
                </div>
              </DeviceInfo>
            )}

            <MetadataItem>
              <InfoLabel>Log ID</InfoLabel>
              <InfoValue style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                {log._id}
              </InfoValue>
            </MetadataItem>
            <MetadataItem>
              <InfoLabel>Created At</InfoLabel>
              <InfoValue>{formatDate(log.createdAt)}</InfoValue>
            </MetadataItem>
            <MetadataItem>
              <InfoLabel>Updated At</InfoLabel>
              <InfoValue>{formatDate(log.updatedAt)}</InfoValue>
            </MetadataItem>
          </InfoCard>
        </Sidebar>
      </Content>
    </LogDetailsContainer>
  );
};

export default LogDetails;