// src/pages/calendar/components/CalendarHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Plus, Filter, Download, Calendar, ArrowLeft, FileText } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../utils/permissions';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DocumentNamingModal from '../../../components/ui/DocumentNamingModal';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 12px;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  white-space: nowrap;
  flex-shrink: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px 0;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 4px 0;
  }

  &:hover {
    color: #333;
  }

  svg {
    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  margin: 0 24px;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin: 0;
    width: 100%;
  }

  @media (max-width: 480px) {
    margin: 0;
  }
`;

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 20px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    gap: 8px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 20px;
      height: 20px;
    }

    @media (max-width: 480px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const PageDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 13px;
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
    width: 100%;
    min-width: 0;
  }

  ${props => props.variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid var(--color-navy);

    &:hover {
      background: #f5f7fb;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 150px;
  overflow: hidden;
  margin-top: 4px;

  @media (max-width: 768px) {
    right: 0;
    left: auto;
    min-width: 140px;
  }

  @media (max-width: 480px) {
    right: 0;
    left: auto;
    min-width: 130px;
    max-width: calc(100vw - 24px);
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
    gap: 8px;
  }
  
  &:hover {
    background: #f5f7fb;
  }
  
  svg {
    color: var(--color-navy);
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const CalendarHeader = ({ onAddEvent, onToggleFilters, onExport }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);
  const dropdownRef = useRef(null);
  
  // Get tasks from Redux store
  const { tasks } = useSelector(state => state.tasks);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle export button click
  const handleExport = (format) => {
    setPendingExport({ format, data: tasks });
    setShowDocumentModal(true);
    setShowExportDropdown(false);
  };

  // Handle confirmed export with custom filename
  const handleConfirmExport = (fileName) => {
    if (!pendingExport) return;
    
    const { format, data } = pendingExport;
    
    if (format === 'pdf') {
      generatePDFExport(data, fileName);
    } else if (format === 'csv') {
      generateCSVExport(data, fileName);
    }
    
    setShowDocumentModal(false);
    setPendingExport(null);
  };

  // Generate PDF with custom filename
  const generatePDFExport = (tasksData, fileName) => {
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `${fileName} - Calendar Events Report`,
      subject: 'MIRSAT System Calendar Events',
      creator: 'MIRSAT System'
    });
    
    // Create a professional header
    doc.setFillColor(26, 35, 126); // Navy blue header background
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Add title with proper positioning
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255); // White text
    doc.text(fileName || 'Calendar Events Report', doc.internal.pageSize.width / 2, 22, { align: 'center' });
    
    // Add date subtitle
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200); // Light gray for subtitle
    doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width / 2, 32, { align: 'center' });
    
    // Content starting position
    const contentStartY = 50;
    
    // Add summary section
    doc.setFontSize(14);
    doc.setTextColor(26, 35, 126); // Navy blue for section headers
    doc.text('Events Summary', 14, contentStartY);
    
    // Prepare summary info
    const pendingEvents = tasksData.filter(task => task.status === 'pending').length;
    const completedEvents = tasksData.filter(task => task.status === 'completed').length;
    const highPriorityEvents = tasksData.filter(task => task.priority === 'high').length;
    
    // Display summary data
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80); // Dark gray for content
    doc.text(`Total Events: ${tasksData.length}`, 14, contentStartY + 10);
    doc.text(`Pending Events: ${pendingEvents}`, 14, contentStartY + 20);
    doc.text(`Completed Events: ${completedEvents}`, 14, contentStartY + 30);
    doc.text(`High Priority Events: ${highPriorityEvents}`, 14, contentStartY + 40);
    
    // Add events table with improved styling
    const tableColumn = [
      "Title", 
      "Status", 
      "Priority", 
      "Assigned To", 
      "Description", 
      "Deadline"
    ];
    
    const tableRows = tasksData.map(task => [
      task.title || '',
      task.status || '',
      task.priority || '',
      task.assignedTo?.length > 0 ? task.assignedTo[0].name : 'Unassigned',
      task.description || '',
      formatDate(task.deadline) || ''
    ]);
    
    // AutoTable configuration with improved styling
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: contentStartY + 60,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [26, 35, 126],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Title
        1: { cellWidth: 20 }, // Status
        2: { cellWidth: 20 }, // Priority
        3: { cellWidth: 30 }, // Assigned To
        4: { cellWidth: 50 }, // Description
        5: { cellWidth: 25 }  // Deadline
      },
      margin: { top: 10, left: 14, right: 14 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
    });
    
    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount} | MIRSAT Calendar Events Report`, 
        doc.internal.pageSize.width / 2, 
        doc.internal.pageSize.height - 10, 
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`${fileName}.pdf`);
  };

  // Generate CSV with custom filename
  const generateCSVExport = (tasksData, fileName) => {
    // Prepare CSV data
    const headers = ["Title", "Status", "Priority", "Assigned To", "Description", "Deadline"];
    
    const csvData = tasksData.map(task => [
      task.title || '',
      task.status || '',
      task.priority || '',
      task.assignedTo?.length > 0 ? task.assignedTo[0].name : 'Unassigned',
      task.description || '',
      formatDate(task.deadline) || ''
    ]);
    
    // Add headers
    csvData.unshift(headers);
    
    // Convert to CSV format
    const csvContent = csvData.map(row => row.map(cell => {
      // Escape quotes and wrap cells with quotes if they contain commas or quotes
      const escaped = String(cell).replace(/"/g, '""');
      return /[,"]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  return (
    <>
      <Header>
        <HeaderTop>
          <BackButton onClick={() => navigate('/tasks')}>
            <ArrowLeft size={18} />
            {t('backToTasks')}
          </BackButton>
          
          <HeaderContent>
            <PageTitle>
              <Calendar size={24} />
              {t('calendarView')}
            </PageTitle>
            <PageDescription>{t('scheduleAndManageTasks')}</PageDescription>
          </HeaderContent>

          <ActionButtons>
            <Button onClick={onToggleFilters}>
              <Filter size={16} />
              {t('filters')}
            </Button>
            
            {hasPermission(PERMISSIONS.EXPORT_TASKS) && (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <Button onClick={() => setShowExportDropdown(!showExportDropdown)}>
                  <Download size={16} />
                  {t('export')}
                </Button>
                
                {showExportDropdown && (
                  <DropdownMenu>
                    <DropdownItem onClick={() => handleExport('pdf')}>
                      <FileText size={16} />
                      {t('exportAsPDF')}
                    </DropdownItem>
                    <DropdownItem onClick={() => handleExport('csv')}>
                      <FileText size={16} />
                      {t('exportAsCSV')}
                    </DropdownItem>
                  </DropdownMenu>
                )}
              </div>
            )}
            
            {hasPermission(PERMISSIONS.TASKS.CREATE_TASKS) && (
              <Button variant="primary" onClick={onAddEvent}>
                <Plus size={16} />
                {t('addEvent')}
              </Button>
            )}
          </ActionButtons>
        </HeaderTop>
      </Header>

      {showDocumentModal && pendingExport && (
        <DocumentNamingModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          onExport={handleConfirmExport}
          exportFormat={pendingExport.format}
          documentType="Calendar-Events-Report"
          defaultCriteria={['documentType', 'currentDate']}
        />
      )}
    </>
  );
};

export default CalendarHeader;