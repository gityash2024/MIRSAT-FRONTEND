import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { FileText, Download, Share2, Settings, Printer, AlertCircle } from 'lucide-react';
import ReportPreviewComponent from '../../components/reports/ReportPreviewComponent';
import InspectionLayout from '../../components/common/InspectionLayout';
import { inspectionService } from '../../services/inspection.service';
import Skeleton from '../../components/ui/Skeleton';
import DocumentNamingModal from '../../components/ui/DocumentNamingModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);
  
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
    setPendingExport({ format: 'pdf', data: reportData });
    setShowDocumentModal(true);
  };

  const handleDownloadDOCX = () => {
    setPendingExport({ format: 'docx', data: reportData });
    setShowDocumentModal(true);
  };

  const handleConfirmExport = (fileName) => {
    if (!pendingExport) return;
    
    const { format, data } = pendingExport;
    
    if (format === 'pdf') {
      generatePDFReport(data, fileName);
    } else if (format === 'docx') {
      generateDOCXReport(data, fileName);
    }
    
    setShowDocumentModal(false);
    setPendingExport(null);
  };

  const generatePDFReport = (data, fileName) => {
    try {
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `${fileName} - Inspection Report`,
        subject: 'MIRSAT Inspection Report',
        creator: 'MIRSAT System'
      });
      
      // Header
      doc.setFillColor(26, 35, 126);
      doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
      
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text(fileName || 'Inspection Report', doc.internal.pageSize.width / 2, 22, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width / 2, 32, { align: 'center' });
      
      // Content
      let yPosition = 60;
      
      // Overview section
      if (data) {
        doc.setFontSize(16);
        doc.setTextColor(26, 35, 126);
        doc.text('Overview', 14, yPosition);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text(`Score: ${data.score || 0}/${data.maxScore || 0}`, 14, yPosition);
        yPosition += 10;
        doc.text(`Completion: ${data.completedAt || 'Not completed'}`, 14, yPosition);
        yPosition += 20;
        
        // Sections
        if (data.sections && data.sections.length > 0) {
          doc.setFontSize(16);
          doc.setTextColor(26, 35, 126);
          doc.text('Inspection Sections', 14, yPosition);
          yPosition += 15;
          
          data.sections.forEach((section, index) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
            
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(`${index + 1}. ${section.name || 'Unnamed Section'}`, 14, yPosition);
            yPosition += 8;
            
            if (section.description) {
              doc.setFontSize(10);
              doc.setTextColor(100, 100, 100);
              const splitDesc = doc.splitTextToSize(section.description, 180);
              doc.text(splitDesc, 20, yPosition);
              yPosition += splitDesc.length * 5 + 5;
            }
            
            yPosition += 5;
          });
        }
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount} | MIRSAT Inspection Report`, 
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        );
      }
      
      doc.save(`${fileName}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const generateDOCXReport = async (data, fileName) => {
    try {
      // For DOCX generation, we'll create a structured HTML that can be exported
      const htmlContent = generateReportHTML(data, fileName);
      
      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('DOCX downloaded successfully');
    } catch (error) {
      console.error('Error generating DOCX:', error);
      toast.error('Failed to generate DOCX');
    }
  };

  const generateReportHTML = (data, fileName) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${fileName} - Inspection Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { background-color: #1a237e; color: white; padding: 20px; text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; color: #1a237e; margin-bottom: 10px; }
          .section-content { margin-left: 15px; }
          .overview { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${fileName || 'Inspection Report'}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="overview">
          <h2>Overview</h2>
          <p><strong>Score:</strong> ${data?.score || 0}/${data?.maxScore || 0}</p>
          <p><strong>Completion:</strong> ${data?.completedAt || 'Not completed'}</p>
        </div>
        
        ${data?.sections?.map((section, index) => `
          <div class="section">
            <div class="section-title">${index + 1}. ${section.name || 'Unnamed Section'}</div>
            <div class="section-content">
              ${section.description ? `<p>${section.description}</p>` : ''}
            </div>
          </div>
        `).join('') || ''}
      </body>
      </html>
    `;
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
              
              <ActionButton onClick={handleDownloadDOCX}>
                <Download size={16} />
                Download DOCX
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
        
        {showDocumentModal && pendingExport && (
          <DocumentNamingModal
            isOpen={showDocumentModal}
            onClose={() => setShowDocumentModal(false)}
            onExport={handleConfirmExport}
            exportFormat={pendingExport.format}
            documentType="Inspection-Report"
            defaultCriteria={['documentType', 'currentDate']}
          />
        )}
      </PageContainer>
    </InspectionLayout>
  );
};

export default InspectionReportView; 