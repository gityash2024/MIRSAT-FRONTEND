// src/pages/calendar/components/CalendarHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Plus, Filter, Download, Calendar, ArrowLeft, FileText } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../utils/permissions';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  &:hover {
    color: #333;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  margin: 0 24px;
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
`;

const PageDescription = styled.p`
  color: #64748b;
  font-size: 14px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

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
  
  &:hover {
    background: #f5f7fb;
  }
  
  svg {
    color: var(--color-navy);
  }
`;

const CalendarHeader = ({ onAddEvent, onToggleFilters }) => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const tasks = useSelector((state) => state.tasks.tasks || []);
  
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

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle PDF export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: 'Calendar Events Report',
      subject: 'MIRSAT System Calendar Events',
      creator: 'MIRSAT System'
    });
    
    // Create a professional header
    doc.setFillColor(26, 35, 126); // Navy blue header background
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Add title with proper positioning
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255); // White text
    doc.text('Calendar Events Report', doc.internal.pageSize.width / 2, 22, { align: 'center' });
    
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
    const pendingEvents = tasks.filter(task => task.status === 'pending').length;
    const completedEvents = tasks.filter(task => task.status === 'completed').length;
    const highPriorityEvents = tasks.filter(task => task.priority === 'high').length;
    
    // Display summary data
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80); // Dark gray for content
    doc.text(`Total Events: ${tasks.length}`, 14, contentStartY + 10);
    doc.text(`Pending Events: ${pendingEvents}`, 14, contentStartY + 20);
    doc.text(`Completed Events: ${completedEvents}`, 14, contentStartY + 30);
    doc.text(`High Priority Events: ${highPriorityEvents}`, 14, contentStartY + 40);
    
    // Add events table with improved styling
    const tableColumn = [
      "Title", 
      "Status", 
      "Priority", 
      "Assigned To",
      "Deadline"
    ];
    
    // Process data for better presentation
    const tableRows = tasks.map(task => [
      task.title || 'Untitled',
      task.status || 'N/A',
      task.priority || 'N/A',
      (task.assignedTo?.length > 0 ? task.assignedTo[0].name : 'Unassigned'),
      formatDate(task.deadline) || 'No deadline'
    ]);
    
    // Add events table with better styling
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: contentStartY + 55,
      styles: { 
        fontSize: 9,
        cellPadding: 5,
        overflow: 'linebreak', // Prevent text overlap
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [26, 35, 126],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Title
        1: { cellWidth: 30 }, // Status
        2: { cellWidth: 25 }, // Priority
        3: { cellWidth: 40 }, // Assigned To
        4: { cellWidth: 35 }  // Deadline
      },
      alternateRowStyles: {
        fillColor: [240, 247, 255]
      },
      // Customize status and priority columns
      didDrawCell: (data) => {
        if (data.section === 'body') {
          // Customize status column
          if (data.column.index === 1) {
            const status = data.cell.raw;
            if (status === 'completed') {
              doc.setFillColor(232, 245, 233); // Light green
              doc.setTextColor(46, 125, 50);   // Dark green
            } else if (status === 'in_progress') {
              doc.setFillColor(225, 245, 254); // Light blue
              doc.setTextColor(2, 136, 209);   // Dark blue
            } else if (status === 'pending') {
              doc.setFillColor(255, 243, 224); // Light orange
              doc.setTextColor(230, 81, 0);    // Dark orange
            }
          }
          
          // Customize priority column
          if (data.column.index === 2) {
            const priority = data.cell.raw;
            if (priority === 'high') {
              doc.setFillColor(255, 235, 238); // Light red
              doc.setTextColor(211, 47, 47);   // Dark red
            } else if (priority === 'medium') {
              doc.setFillColor(255, 243, 224); // Light orange
              doc.setTextColor(230, 81, 0);    // Dark orange
            } else if (priority === 'low') {
              doc.setFillColor(232, 245, 233); // Light green
              doc.setTextColor(46, 125, 50);   // Dark green
            }
          }
        }
      },
      // Reset colors after processing cells
      didParseCell: (data) => {
        if (data.section === 'body') {
          doc.setTextColor(60, 60, 60); // Reset text color
        }
      }
    });
    
    // Add footer with page numbers
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
    doc.save('calendar-events.pdf');
    setShowExportDropdown(false);
  };
  
  // Handle CSV export
  const handleExportCSV = () => {
    // Prepare CSV data
    const headers = ["Title", "Status", "Priority", "Assigned To", "Description", "Deadline"];
    
    const csvData = tasks.map(task => [
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
    link.setAttribute('download', 'calendar-events.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportDropdown(false);
  };

  return (
    <Header>
      <HeaderTop>
        <BackButton onClick={() => navigate('/tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        
        <HeaderContent>
          <PageTitle>
            <Calendar size={24} />
            Calendar View
          </PageTitle>
          <PageDescription>Schedule and manage inspection tasks on a calendar</PageDescription>
        </HeaderContent>

        <ActionButtons>
          <Button onClick={onToggleFilters}>
            <Filter size={16} />
            Filters
          </Button>
          
          {hasPermission(PERMISSIONS.EXPORT_TASKS) && (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <Button onClick={() => setShowExportDropdown(!showExportDropdown)}>
                <Download size={16} />
                Export
              </Button>
              
              {showExportDropdown && (
                <DropdownMenu>
                  <DropdownItem onClick={handleExportPDF}>
                    <FileText size={16} />
                    Export as PDF
                  </DropdownItem>
                  <DropdownItem onClick={handleExportCSV}>
                    <FileText size={16} />
                    Export as CSV
                  </DropdownItem>
                </DropdownMenu>
              )}
            </div>
          )}
          
          {hasPermission(PERMISSIONS.TASKS.CREATE_TASKS) && (
            <Button variant="primary" onClick={onAddEvent}>
              <Plus size={16} />
              Add Event
            </Button>
          )}
        </ActionButtons>
      </HeaderTop>
    </Header>
  );
};

export default CalendarHeader;