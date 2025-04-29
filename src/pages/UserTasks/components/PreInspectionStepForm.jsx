import React from 'react';
import styled from 'styled-components';
import { Clock, Calendar, AlertTriangle, Activity, CheckCircle, XCircle, Database, MapPin, User, Briefcase } from 'lucide-react';

const Container = styled.div`
  padding: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 24px;
`;

const Description = styled.p`
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  white-space: pre-wrap;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin-bottom: 24px;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4b5563;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.5);
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.7);
  }
  
  svg {
    color: var(--color-navy);
    flex-shrink: 0;
  }
  
  strong {
    font-weight: 600;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return `
          background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%);
          color: #e65100;
          border: 1px solid rgba(245, 124, 0, 0.2);
        `;
      case 'in_progress':
        return `
          background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
          color: #0069c0;
          border: 1px solid rgba(2, 136, 209, 0.2);
        `;
      case 'completed':
        return `
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          color: #2e7d32;
          border: 1px solid rgba(56, 142, 60, 0.2);
        `;
      case 'incomplete':
        return `
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          color: #c62828;
          border: 1px solid rgba(211, 47, 47, 0.2);
        `;
      default:
        return `
          background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
          color: #424242;
          border: 1px solid rgba(97, 97, 97, 0.2);
        `;
    }
  }}
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  
  ${props => {
    switch(props.priority) {
      case 'high':
        return 'background-color: rgba(255, 235, 238, 0.8); color: #d32f2f; border: 1px solid rgba(211, 47, 47, 0.2);';
      case 'medium':
        return 'background-color: rgba(255, 248, 225, 0.8); color: #f57c00; border: 1px solid rgba(245, 124, 0, 0.2);';
      case 'low':
        return 'background-color: rgba(232, 245, 233, 0.8); color: #2e7d32; border: 1px solid rgba(46, 125, 50, 0.2);';
      default:
        return 'background-color: rgba(245, 245, 245, 0.8); color: #616161; border: 1px solid rgba(97, 97, 97, 0.2);';
    }
  }}
`;

const AssetInfo = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.7);
`;

const AssetTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AssetDetail = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
  
  strong {
    font-weight: 600;
    color: #1f2937;
  }
`;

const StatusIcon = ({ status, size = 18 }) => {
  switch (status) {
    case 'pending':
      return <Clock size={size} color="#f57c00" />;
    case 'in_progress':
      return <Activity size={size} color="#0288d1" />;
    case 'completed':
      return <CheckCircle size={size} color="#388e3c" />;
    case 'incomplete':
      return <XCircle size={size} color="#d32f2f" />;
    default:
      return <Clock size={size} color="#616161" />;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const PreInspectionStepForm = ({ task }) => {
  if (!task) return <div>Loading task details...</div>;
  
  // Get asset information, handling both ID and populated object
  const getAssetInfo = () => {
    if (!task.asset) return null;
    
    // If asset is just an ID string
    if (typeof task.asset === 'string') {
      return { id: task.asset, displayName: 'Loading asset details...', type: 'N/A', uniqueId: '' };
    }
    
    return {
      id: task.asset._id,
      displayName: task.asset.displayName || task.asset.name || 'Unnamed Asset',
      type: task.asset.type || 'N/A',
      uniqueId: task.asset.uniqueId || '',
      serialNumber: task.asset.serialNumber || '',
      location: task.asset.location || '',
      manufacturer: task.asset.manufacturer || ''
    };
  };
  
  const asset = getAssetInfo();
  
  // Check if deadline is overdue
  const isOverdue = () => {
    if (!task.deadline) return false;
    return new Date(task.deadline) < new Date() && task.status !== 'completed';
  };

  return (
    <Container>
      <Title>Task Details</Title>
      <Description>{task.description}</Description>
      
      <MetaGrid>
        <MetaItem>
          <Calendar size={16} />
          <span style={{ 
            color: isOverdue() ? '#d32f2f' : '#4b5563' 
          }}>
            Deadline: <strong>{formatDate(task.deadline)}</strong>
            {isOverdue() && ' (Overdue)'}
          </span>
        </MetaItem>
        
        <MetaItem>
          <AlertTriangle size={16} />
          <span>Priority: 
            <PriorityBadge priority={task.priority}>
              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Medium'}
            </PriorityBadge>
          </span>
        </MetaItem>
        
        <MetaItem>
          <Activity size={16} />
          <span>Status: 
            <StatusBadge status={task.status}>
              <StatusIcon status={task.status} size={14} />
              {task.status?.charAt(0).toUpperCase() + task.status?.slice(1).replace('_', ' ') || 'Pending'}
            </StatusBadge>
          </span>
        </MetaItem>
        
        {task.inspectionLevel && (
          <MetaItem>
            <CheckCircle size={16} />
            <span>Template: <strong>{task.inspectionLevel.name || 'N/A'}</strong></span>
          </MetaItem>
        )}
        
        {task.location && (
          <MetaItem>
            <MapPin size={16} />
            <span>Location: <strong>{task.location}</strong></span>
          </MetaItem>
        )}
        
        {task.assignedTo && task.assignedTo.length > 0 && (
          <MetaItem>
            <User size={16} />
            <span>Assigned To: <strong>
              {task.assignedTo.map(user => user.name || 'Unknown User').join(', ')}
            </strong></span>
          </MetaItem>
        )}
        
        {task.createdBy && (
          <MetaItem>
            <Briefcase size={16} />
            <span>Created By: <strong>{typeof task.createdBy === 'object' ? task.createdBy.name : 'N/A'}</strong></span>
          </MetaItem>
        )}
      </MetaGrid>
      
      {asset && (
        <AssetInfo>
          <AssetTitle>
            <Database size={18} />
            Asset Information
          </AssetTitle>
          <AssetDetail><strong>Asset ID:</strong> {asset.id || 'N/A'}</AssetDetail>
          <AssetDetail><strong>Asset Name:</strong> {asset.displayName || 'N/A'}</AssetDetail>
          <AssetDetail><strong>Asset Type:</strong> {asset.type || 'N/A'}</AssetDetail>
          
          {asset.uniqueId && (
            <AssetDetail><strong>Unique ID:</strong> {asset.uniqueId}</AssetDetail>
          )}
          
          {asset.serialNumber && (
            <AssetDetail><strong>Serial Number:</strong> {asset.serialNumber}</AssetDetail>
          )}
          
          {asset.location && (
            <AssetDetail><strong>Location:</strong> {asset.location}</AssetDetail>
          )}
          
          {asset.manufacturer && (
            <AssetDetail><strong>Manufacturer:</strong> {asset.manufacturer}</AssetDetail>
          )}
        </AssetInfo>
      )}
    </Container>
  );
};

export default PreInspectionStepForm;