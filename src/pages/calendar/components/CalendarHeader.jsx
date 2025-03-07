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
  color: #1a237e;
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
    background: #1a237e;
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: #1a237e;
    border: 1px solid #1a237e;

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
    color: #1a237e;
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
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(26, 35, 126); // #1a237e
    doc.text('Calendar Events Report', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Prepare table data
    const tableColumn = ["Title", "Status", "Priority", "Assigned To", "Deadline"];
    const tableRows = tasks.map(task => [
      task.title,
      task.status,
      task.priority,
      task.assignedTo?.length > 0 ? task.assignedTo[0].name : 'Unassigned',
      formatDate(task.deadline)
    ]);
    
    // Add table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { 
        fillColor: [26, 35, 126],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [240, 240, 245] }
    });
    
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
          
          {hasPermission(PERMISSIONS.CREATE_TASKS) && (
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