import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Flag,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Download,
  Loader
} from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import ScrollAnimation from '../../components/common/ScrollAnimation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Container = styled.div`
  min-height: 100vh;
  padding: 24px;
  background-color: var(--color-offwhite);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const FiltersContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-dark);
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid var(--color-gray-light);
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: var(--color-navy);
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }

  &:hover {
    border-color: var(--color-gray-medium);
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--color-gray-light);
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: var(--color-navy);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: none;

  &.primary {
    background-color: var(--color-navy);
    color: white;

    &:hover {
      background-color: var(--color-navy-dark);
    }

    &:disabled {
      background-color: var(--color-gray-light);
      cursor: not-allowed;
    }
  }

  &.secondary {
    background-color: white;
    color: var(--color-navy);
    border: 1px solid var(--color-gray-light);

    &:hover {
      background-color: var(--color-offwhite);
    }
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  position: relative;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: var(--color-offwhite);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: var(--color-gray-dark);
    font-size: 14px;
    border-bottom: 2px solid var(--color-gray-light);
  }

  td {
    padding: 16px;
    border-bottom: 1px solid var(--color-gray-light);
    color: var(--color-navy);
    font-size: 14px;
  }

  tbody tr {
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-offwhite);
    }
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.danger {
    background-color: #fee2e2;
    color: #dc2626;
  }

  &.warning {
    background-color: #fef3c7;
    color: #d97706;
  }

  &.info {
    background-color: #dbeafe;
    color: #2563eb;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PaginationInfo = styled.div`
  color: var(--color-gray-medium);
  font-size: 14px;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid var(--color-gray-light);
  border-radius: 6px;
  background: white;
  color: var(--color-navy);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover:not(:disabled) {
    background-color: var(--color-offwhite);
    border-color: var(--color-navy);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background-color: var(--color-navy);
    color: white;
    border-color: var(--color-navy);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--color-gray-medium);

  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  color: var(--color-navy);

  svg {
    animation: spin 1.5s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  flex-direction: column;
  color: var(--color-navy);
  border-radius: 12px;

  svg {
    animation: spin 1.5s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CardWrapper = styled.div`
  position: relative;
`;

const FlaggedItems = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: ''
  });

  // Options for filters - commented out as we only use search now
  // const [templates, setTemplates] = useState([]);
  // const [assets, setAssets] = useState([]);
  // const [inspectors, setInspectors] = useState([]);

  // useEffect(() => {
  //   fetchFilterOptions();
  // }, []);

  useEffect(() => {
    fetchFlaggedItems();
  }, [pagination.page, filters]);

  // const fetchFilterOptions = async () => {
  //   try {
  //     // Fetch templates, assets, and inspectors for filter dropdowns
  //     const [templatesRes, assetsRes, inspectorsRes] = await Promise.all([
  //       api.get('/inspection?limit=1000'),
  //       api.get('/assets?limit=1000'),
  //       api.get('/users', { params: { role: 'inspector', limit: 1000 } })
  //     ]);

  //     if (templatesRes.data?.results) {
  //       setTemplates(templatesRes.data.results);
  //     }
  //     if (assetsRes.data?.data) {
  //       setAssets(assetsRes.data.data);
  //     }
  //     if (inspectorsRes.data?.data) {
  //       // Filter inspectors from the response
  //       const allUsers = inspectorsRes.data.data || [];
  //       const inspectorUsers = allUsers.filter(user => user.role === 'inspector');
  //       setInspectors(inspectorUsers);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching filter options:', error);
  //   }
  // };

  const fetchFlaggedItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Only use search filter
      if (filters.search) params.append('search', filters.search);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await api.get(`/dashboard/flagged-items?${params.toString()}`);
      
      if (response.data && response.data.success) {
        setFlaggedItems(response.data.data || []);
        setPagination(response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
      }
    } catch (error) {
      console.error('Error fetching flagged items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleResetFilters = () => {
    setFilters({
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportPDF = async () => {
    try {
      // Fetch all flagged items for export
      const params = new URLSearchParams();
      // Only use search filter
      if (filters.search) params.append('search', filters.search);
      params.append('limit', '10000'); // Get all for export

      const response = await api.get(`/dashboard/flagged-items?${params.toString()}`);
      const allItems = response.data?.data || [];

      const doc = new jsPDF();
      
      // Load Arabic font
      const fontLoaded = await loadArabicFont(doc);
      
      doc.setFontSize(18);
      doc.text("Flagged Items Report", 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

      const tableData = allItems.map(item => [
        item.taskTitle || 'N/A',
        item.templateName || 'N/A',
        item.assetName || 'N/A',
        item.inspectorName || 'N/A',
        item.questionText || 'N/A',
        item.response || 'N/A',
        new Date(item.flaggedAt).toLocaleDateString()
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Task', 'Template', 'Asset', 'Inspector', 'Question', 'Response', 'Date']],
        body: tableData,
        didParseCell: function (data) {
          if (data.cell.raw && containsArabic(String(data.cell.raw))) {
            if (fontLoaded) {
              data.cell.styles.font = 'NotoNaskhArabic';
              data.cell.styles.fontStyle = 'normal';
            }
          }
        },
        styles: {
          font: 'helvetica',
          fontSize: 9,
        },
        headStyles: {
          font: 'helvetica',
          fontStyle: 'bold',
          fontSize: 9,
        },
      });

      doc.save("flagged_items_report.pdf");
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  // Helper functions for PDF
  const containsArabic = (text) => {
    if (!text) return false;
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicPattern.test(String(text));
  };

  const loadArabicFont = async (doc) => {
    try {
      const response = await fetch('https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf');
      const fontArrayBuffer = await response.arrayBuffer();
      const fontBase64 = btoa(
        new Uint8Array(fontArrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', fontBase64);
      doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
      return true;
    } catch (error) {
      console.warn('Could not load Arabic font:', error);
      return false;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'completed': { label: t('tasks.completed'), class: 'info' },
      'archived': { label: t('tasks.completed'), class: 'info' },
      'in_progress': { label: t('tasks.inProgress'), class: 'warning' },
      'pending': { label: t('tasks.pending'), class: 'warning' },
      'incomplete': { label: t('tasks.incomplete'), class: 'danger' },
      'partially_completed': { label: t('tasks.partiallyCompleted'), class: 'warning' }
    };

    const statusInfo = statusMap[status] || { label: status, class: 'info' };
    return (
      <Badge className={statusInfo.class}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading && flaggedItems.length === 0) {
    return (
      <Container>
        <LoadingContainer>
          <Loader size={40} />
          <p>{t('common.loading')}</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollAnimation animation="slideUp">
        <Header>
          <Title>
            <Flag color="#f59e0b" size={32} />
            {t('dashboard.flaggedItems')}
          </Title>
          <ButtonGroup>
            <Button className="primary" onClick={handleExportPDF}>
              <Download size={18} />
              {t('common.export')} PDF
            </Button>
          </ButtonGroup>
        </Header>
      </ScrollAnimation>

      <ScrollAnimation animation="slideIn" delay={0.1}>
        <FiltersContainer>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <FilterGroup style={{ flex: '1', minWidth: '200px' }}>
              <Label>
                <Search size={14} style={{ marginRight: '6px', display: 'inline' }} />
                {t('common.search')}
              </Label>
              <Input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </FilterGroup>
            <Button className="secondary" onClick={handleResetFilters} style={{ marginTop: '24px' }}>
              <X size={16} />
              {t('common.reset')}
            </Button>
          </div>
        </FiltersContainer>
      </ScrollAnimation>

      <ScrollAnimation animation="slideIn" delay={0.2}>
        <CardWrapper>
          {loading && (
            <LoadingOverlay>
              <Loader size={40} />
              <p>{t('common.loading')}</p>
            </LoadingOverlay>
          )}
          <Card>
            {!loading && flaggedItems.length === 0 ? (
              <EmptyState>
                <Flag size={48} />
                <h3>{t('dashboard.noFlaggedItems') || 'No Flagged Items'}</h3>
                <p>{t('dashboard.noFlaggedItemsDescription') || 'There are no flagged items matching your filters.'}</p>
              </EmptyState>
            ) : (
              <>
                <Table>
                <thead>
                  <tr>
                    <th>{t('common.task')}</th>
                    <th>{t('common.template')}</th>
                    <th>{t('common.asset')}</th>
                    {/* <th>{t('common.inspector')}</th> */}
                    <th>{t('dashboard.question')}</th>
                    <th>{t('dashboard.response')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.date')}</th>
                    {/* <th>{t('common.actions')}</th> */}
                  </tr>
                </thead>
                <tbody>
                  {flaggedItems.map((item, index) => (
                    <tr key={`${item.taskId}-${item.questionId}-${index}`}>
                      <td style={{ fontWeight: '500' }}>{item.taskTitle || 'N/A'}</td>
                      <td>{item.templateName || 'N/A'}</td>
                      <td>{item.assetName || 'N/A'}</td>
                      {/* <td>{item.inspectorName || 'N/A'}</td> */}
                      <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                        {item.questionText || 'N/A'}
                      </td>
                      <td>
                        <Badge className="danger">{item.response || 'N/A'}</Badge>
                      </td>
                      <td>{getStatusBadge(item.taskStatus)}</td>
                      <td>{formatDate(item.flaggedAt)}</td>
                      {/* <td>
                        <Button
                          className="secondary"
                          onClick={() => navigate(`/tasks/${item.taskId}`)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Eye size={14} />
                          {t('common.view')}
                        </Button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </Table>

              {pagination.pages > 1 && (
                <Pagination>
                  <PaginationInfo>
                    {t('common.showing')} {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('common.of')} {pagination.total} {t('common.results')}
                  </PaginationInfo>
                  <PaginationButtons>
                    <PaginationButton
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft size={16} />
                      {t('common.previous')}
                    </PaginationButton>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <PaginationButton
                          key={pageNum}
                          className={pagination.page === pageNum ? 'active' : ''}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </PaginationButton>
                      );
                    })}
                    <PaginationButton
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      {t('common.next')}
                      <ChevronRight size={16} />
                    </PaginationButton>
                  </PaginationButtons>
                </Pagination>
              )}
            </>
            )}
          </Card>
        </CardWrapper>
      </ScrollAnimation>
    </Container>
  );
};

export default FlaggedItems;

