import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { FileText, Download, Share2, Settings, Printer, AlertCircle } from 'lucide-react';
import ReportPreviewComponent from '../../components/reports/ReportPreviewComponent';
import InspectionLayout from '../../components/common/InspectionLayout';
import { inspectionService } from '../../services/inspection.service';
import Skeleton from '../../components/ui/Skeleton';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
`;

const ToolbarTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolbarActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: ${props => props.primary ? 'var(--color-navy)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--color-navy)'};
  border: ${props => props.primary ? 'none' : '1px solid var(--color-gray-light)'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--color-navy-dark)' : 'var(--color-offwhite)'};
    transform: translateY(-1px);
  }
`;

const ReportPreviewContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const NoDataContainer = styled.div`
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
`;

const NoDataTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
  color: var(--color-navy);
`;

const NoDataMessage = styled.p`
  color: var(--color-gray-medium);
  margin-bottom: 24px;
`;

const NoDataButton = styled.button`
  background-color: var(--color-navy);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--color-navy-dark);
  }
`;

const LoadingContainer = styled.div`
  padding: 20px;
`;

const InspectionReportView = ({ isCreating = false, isEditing = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (id && !isCreating) {
      loadTemplateData();
    } else {
      setLoading(false);
    }
  }, [id, isCreating]);
  
  const loadTemplateData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inspectionService.getInspectionLevel(id);
      setTemplate(data);
      
      // Transform template data into report data format
      const reportDataFormat = transformTemplateToReportData(data);
      setReportData(reportDataFormat);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template data');
      setLoading(false);
    }
  };
  
  const transformTemplateToReportData = (templateData) => {
    // Extract sections from subLevels or sets
    const sections = [];
    let totalScore = 0;
    let maxScore = 0;
    
    if (!templateData) {
      return {
        title: 'Inspection Template',
        score: 0,
        maxScore: 0,
        completedAt: new Date().toLocaleString(),
        sections: [],
        flaggedItems: [],
        metadata: {
          documentNumber: 'Template ID: Unknown',
          inspectionLocation: 'Not specified',
          inspectionDate: new Date().toLocaleDateString(),
          inspectorName: 'Not assigned',
          operatorName: 'Draft Template'
        }
      };
    }
    
    // Process sublevels
    const processSubLevels = (subLevels, parentName = '') => {
      if (!subLevels || !subLevels.length) return [];
      
      const processedSections = [];
      
      subLevels.forEach((level, index) => {
        if (!level) return;
        
        const sectionName = parentName ? `${parentName} - ${level.name || 'Unnamed Section'}` : (level.name || 'Unnamed Section');
        
        // Calculate score for this section
        const sectionScore = 10; // This would be calculated based on real data
        const sectionMaxScore = 20; // This would be calculated based on real data
        
        totalScore += sectionScore;
        maxScore += sectionMaxScore;
        
        // Get compliance status
        const status = getComplianceStatus(sectionScore, sectionMaxScore);
        
        // Process items within the section
        const items = level.questions ? level.questions.map(q => ({
          title: q.text || 'Unnamed Question',
          status: 'partial_compliance' // This would be determined by actual data
        })) : [];
        
        // Create unique section ID
        const sectionId = `section_${level._id || `idx_${index}_${Date.now().toString(36)}`}`;
        
        const section = {
          id: sectionId,
          name: sectionName,
          score: sectionScore,
          maxScore: sectionMaxScore,
          status,
          items
        };
        
        processedSections.push(section);
        
        // Process child sublevels if they exist
        if (level.subLevels && level.subLevels.length) {
          const childSections = processSubLevels(level.subLevels, sectionName);
          processedSections.push(...childSections);
        }
      });
      
      return processedSections;
    };
    
    // Process sets if available
    if (templateData.sets && templateData.sets.length > 0) {
      templateData.sets.forEach((set, setIndex) => {
        if (set && set.subLevels && set.subLevels.length) {
          const setSections = processSubLevels(set.subLevels, set.name || `Set ${setIndex + 1}`);
          sections.push(...setSections);
        }
      });
    } else if (templateData.subLevels && templateData.subLevels.length > 0) {
      // Only process top level subLevels if no sets are available
      const topLevelSections = processSubLevels(templateData.subLevels);
      sections.push(...topLevelSections);
    }
    
    return {
      title: templateData.name || 'Inspection Template',
      score: totalScore,
      maxScore: maxScore,
      completedAt: new Date().toLocaleString(),
      sections,
      flaggedItems: [], // These would be items that failed compliance
      metadata: {
        documentNumber: 'Template ID: ' + (id || 'Unknown'),
        inspectionLocation: 'Not specified',
        inspectionDate: new Date().toLocaleDateString(),
        inspectorName: 'Not assigned',
        operatorName: 'Draft Template'
      }
    };
  };
  
  const getComplianceStatus = (score, maxScore) => {
    if (!maxScore) return 'not_applicable';
    
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'full_compliance';
    if (percentage >= 40) return 'partial_compliance';
    return 'non_compliance';
  };
  
  const handleDownloadPDF = () => {
    toast.success('PDF generation started');
    // Actual PDF generation would be implemented here
  };
  
  const handlePublish = () => {
    toast.success('Template published successfully');
    // Actual publish logic would be implemented here
  };
  
  const handleGoToBuildTab = () => {
    if (isCreating) {
      navigate('/inspection/create/build');
    } else if (isEditing) {
      navigate(`/inspection/${id}/edit/build`);
    } else {
      navigate(`/inspection/${id}/build`);
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <Skeleton.Rectangle height="400px" />
        </LoadingContainer>
      );
    }
    
    if (isCreating || !reportData) {
      return (
        <NoDataContainer>
          <FileText size={48} color="var(--color-gray-light)" style={{ marginBottom: '16px' }} />
          <NoDataTitle>No report data available yet</NoDataTitle>
          <NoDataMessage>
            You need to build your template before previewing the report.
          </NoDataMessage>
          <NoDataButton onClick={handleGoToBuildTab}>
            Go to Build Tab
          </NoDataButton>
        </NoDataContainer>
      );
    }
    
    try {
      return (
        <ReportPreviewContainer>
          <ReportPreviewComponent reportData={reportData} />
        </ReportPreviewContainer>
      );
    } catch (error) {
      console.error('Error rendering report preview:', error);
      return (
        <NoDataContainer>
          <AlertCircle size={48} color="var(--color-compliance-non)" style={{ marginBottom: '16px' }} />
          <NoDataTitle>Error displaying report</NoDataTitle>
          <NoDataMessage>
            There was a problem displaying the report. Please try again later.
          </NoDataMessage>
          <NoDataButton onClick={handleGoToBuildTab}>
            Go to Build Tab
          </NoDataButton>
        </NoDataContainer>
      );
    }
  };
  
  const baseUrl = isEditing ? `/inspection/${id}/edit` : isCreating ? '/inspection/create' : `/inspection/${id}`;
  
  return (
    <InspectionLayout
      title={template?.name || 'New Inspection Template'}
      onSave={() => {}}
      onPublish={!isCreating ? handlePublish : null}
      baseUrl={baseUrl}
      lastPublished={template?.updatedAt ? new Date(template.updatedAt).toLocaleString() : null}
    >
      <PageContainer>
        {!isCreating && (
          <ToolbarContainer>
            <ToolbarTitle>
              <FileText size={18} />
              Report Preview
            </ToolbarTitle>
            
            <ToolbarActions>
              <ActionButton onClick={handleDownloadPDF} primary>
                <Download size={16} />
                Download PDF
              </ActionButton>
              
              <ActionButton>
                <Share2 size={16} />
                Share
              </ActionButton>
              
              <ActionButton>
                <Printer size={16} />
                Print
              </ActionButton>
              
              <ActionButton>
                <Settings size={16} />
                Settings
              </ActionButton>
            </ToolbarActions>
          </ToolbarContainer>
        )}
        
        {renderContent()}
      </PageContainer>
    </InspectionLayout>
  );
};

export default InspectionReportView; 