import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Calendar,
  CheckSquare,
  Clock,
  AlertTriangle,
  Flag,
  Download,
  Loader,
  Eye,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ScrollAnimation from '../components/common/ScrollAnimation';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DocumentNamingModal from '../components/ui/DocumentNamingModal';
import {
  exportText,
  formatExportDate,
  formatPdfText,
  isArabicExport,
  loadPdfArabicFont as loadExportArabicFont,
  localizePdfTable,
  orderForLanguage,
  orderRowsForLanguage
} from '../utils/exportLocalization';

const DashboardContainer = styled.div`
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

const WelcomeText = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 28px;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e7edf5;
  display: flex;
  flex-direction: column;
  min-height: 206px;
  appearance: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:is(button):hover {
    border-color: #cbd8ea;
    box-shadow: 0 8px 18px rgba(15, 23, 70, 0.09);
    transform: translateY(-1px);
  }
  
  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    background-color: var(--color-skyblue);
  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-navy);
    margin-bottom: 4px;
  }

  .label {
    font-size: 14px;
    color: var(--color-gray-medium);
  }
`;

const StatInsight = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 6px 9px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;

  &.positive {
    color: #059669;
    background: #dff8ec;
  }

  &.warning {
    color: #b45309;
    background: #fff4d6;
  }

  &.danger {
    color: #dc2626;
    background: #fee8e7;
  }
`;

const StatViewButton = styled.button`
  width: 100%;
  margin-top: auto;
  min-height: 32px;
  border: 0;
  border-radius: 8px;
  background: #e0f2fe;
  color: var(--color-navy);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: #bae6fd;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 360px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  
  &:has(.template-chart-container) {
    overflow-x: auto;
    overflow-y: visible;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 320px;
  min-height: 320px;
  position: relative;
  overflow: visible;
  
  &.template-chart-container {
    overflow-x: auto;
    overflow-y: visible;
    
    &::-webkit-scrollbar {
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
      
      &:hover {
        background: #94a3b8;
      }
    }
  }
`;

const DoughnutCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  padding-bottom: 28px;

  strong {
    color: var(--color-navy);
    font-size: 30px;
    line-height: 1;
  }

  span {
    margin-top: 4px;
    color: var(--color-gray-medium);
    font-size: 12px;
  }
`;

const StatusHoverCard = styled.div`
  position: absolute;
  z-index: 3;
  top: 50%;
  left: calc(50% + 116px);
  width: max-content;
  min-width: 132px;
  transform: translateY(-50%);
  padding: 10px 12px;
  border: 1px solid #dbe5f0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 8px 20px rgba(15, 23, 70, 0.14);
  color: #374151;
  pointer-events: none;

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 14px;
    font-weight: 600;
  }

  span {
    margin-top: 4px;
    color: #64748b;
    font-size: 13px;
  }

  @media (max-width: 560px) {
    top: 222px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const SectionAction = styled.button`
  flex-shrink: 0;
  border: 0;
  background: none;
  color: var(--color-info);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  padding: 0;

  &:hover {
    color: var(--color-navy);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 390px;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    thead {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid var(--color-gray-light);
    }
    
    th {
      font-weight: 600;
      color: var(--color-gray-dark);
      background-color: var(--color-offwhite);
    }
    
    td {
      color: var(--color-navy);
      font-size: 14px;
    }
  }
`;

const ExportRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
`;

const ExportButton = styled.button`
  background-color: var(--color-navy);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: var(--color-navy-dark);
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

const STATUS_COLORS = {
  Completed: '#10b981',
  Pending: '#f59e0b',
  Late: '#ef4444'
};

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [data, setData] = useState({
    stats: { total: 0, completed: 0, pending: 0, delayed: 0, flagged: 0 },
    charts: {
      statusDistribution: { completed: 0, pending: 0, late: 0 },
      inspectorPerformance: [],
      templateUsage: []
    },
    upcomingInspections: []
  });
  const [loading, setLoading] = useState(true);
  const [inspectorSort, setInspectorSort] = useState({ key: null, direction: 'asc' });
  const [templateSort, setTemplateSort] = useState({ key: null, direction: 'asc' });
  const [showAllInspectors, setShowAllInspectors] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState(null);

  const sortedInspectors = useMemo(() => {
    const rows = [...(data?.charts?.inspectorPerformance || [])];
    if (!inspectorSort.key) return rows;
    return rows.sort((a, b) => {
      const left = Number(a[inspectorSort.key] || 0);
      const right = Number(b[inspectorSort.key] || 0);
      return inspectorSort.direction === 'asc' ? left - right : right - left;
    });
  }, [data?.charts?.inspectorPerformance, inspectorSort]);

  const sortedTemplates = useMemo(() => {
    const rows = [...(data?.charts?.templateUsage || [])];
    if (!templateSort.key) return rows;
    return rows.sort((a, b) => {
      const left = Number(a[templateSort.key] || 0);
      const right = Number(b[templateSort.key] || 0);
      return templateSort.direction === 'asc' ? left - right : right - left;
    });
  }, [data?.charts?.templateUsage, templateSort]);

  const toggleSort = (setter, current, key) => setter({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
  });

  const SortIndicator = ({ active, direction }) => active ? (
    direction === 'asc' ? <ChevronUp size={14} aria-label="ascending" /> : <ChevronDown size={14} aria-label="descending" />
  ) : null;

  const totalTasks = Number(data?.stats?.total) || 0;
  const percentOfTotal = (value) => totalTasks > 0 ? ((Number(value) || 0) / totalTasks) * 100 : 0;
  const percentageLabel = (value) => percentOfTotal(value).toLocaleString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
    maximumFractionDigits: 1
  });
  const formatTaskCount = (value) => {
    const count = Number(value) || 0;
    const key = count === 1 ? 'dashboard.taskCountSingular' : 'dashboard.taskCountPlural';
    return t(key, { count, defaultValue: `${count} ${count === 1 ? 'task' : 'tasks'}` });
  };
  const formatDuration = (value) => {
    const totalMinutes = Math.round(Number(value) || 0);
    if (totalMinutes <= 0) return '—';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const fetchDashboardData = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.templateId) params.append('templateId', filters.templateId);
      if (filters.assetId) params.append('assetId', filters.assetId);
      if (filters.inspectorId) params.append('inspectorId', filters.inspectorId);
      if (filters.assetTypeId) params.append('assetTypeId', filters.assetTypeId);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const response = await api.get(`/dashboard/stats?${params.toString()}`);
      if (response.data && response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFilterChange = (filters) => {
    fetchDashboardData(filters);
  };

  const handleConfirmExport = async (fileName, language = 'en') => {
    const L = (key) => exportText(language, key);
    const doc = new jsPDF();
    
    // Load Arabic font
    const fontLoaded = await loadExportArabicFont(doc);
    if (isArabicExport(language) && fontLoaded) {
      doc.setFont('NotoNaskhArabic', 'normal');
    }
    
    doc.setFontSize(18);
    doc.text(formatPdfText(L('dashboardReport'), language), isArabicExport(language) ? doc.internal.pageSize.width - 14 : 14, 22, { align: isArabicExport(language) ? 'right' : 'left' });
    doc.setFontSize(12);
    doc.text(formatPdfText(`${L('generatedOnColon')} ${formatExportDate(new Date(), language)}`, language), isArabicExport(language) ? doc.internal.pageSize.width - 14 : 14, 32, { align: isArabicExport(language) ? 'right' : 'left' });

    // Stats
    const statsData = [
      [L('totalTasks'), data?.stats?.total || 0],
      [L('completedTasks'), data?.stats?.completed || 0],
      [L('pendingTasks'), data?.stats?.pending || 0],
      [L('delayedInspections'), data?.stats?.delayed || 0],
      [L('flaggedItems'), data?.stats?.flagged || 0]
    ];

    autoTable(doc, {
      startY: 40,
      head: [orderForLanguage([L('metric'), L('value')].map(label => formatPdfText(label, language)), language)],
      body: orderRowsForLanguage(statsData.map(row => row.map(cell => formatPdfText(cell, language))), language),
      didParseCell: (cellData) => localizePdfTable(cellData, language, fontLoaded)
    });

    // Upcoming Inspections
    doc.text(formatPdfText(L('upcomingInspections'), language), isArabicExport(language) ? doc.internal.pageSize.width - 14 : 14, doc.lastAutoTable.finalY + 15, { align: isArabicExport(language) ? 'right' : 'left' });

    const upcomingData = (data?.upcomingInspections || []).map(item => [
      formatPdfText(item.name || '', language),
      formatExportDate(item.date, language),
      formatPdfText(item.assetType || '', language)
    ]);

    // Configure autoTable to handle Arabic text
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [orderForLanguage([L('inspectionName'), L('date'), L('assetType')].map(label => formatPdfText(label, language)), language)],
      body: orderRowsForLanguage(upcomingData, language),
      didParseCell: function (data) {
        localizePdfTable(data, language, fontLoaded);
      },
      styles: {
        font: 'helvetica',
        fontSize: 10,
      },
      headStyles: {
        font: 'helvetica',
        fontStyle: 'bold',
        fontSize: 10,
      },
    });

    // Add Flagged Items section if there are any
    if (data?.stats?.flagged > 0) {
      doc.text(formatPdfText(L('flaggedItemsSummary'), language), isArabicExport(language) ? doc.internal.pageSize.width - 14 : 14, doc.lastAutoTable.finalY + 20, { align: isArabicExport(language) ? 'right' : 'left' });
      
      // Fetch flagged items for the report
      try {
        const flaggedResponse = await api.get('/dashboard/flagged-items?limit=100');
        const flaggedItems = flaggedResponse.data?.data || [];
        
        if (flaggedItems.length > 0) {
          const flaggedData = flaggedItems.slice(0, 50).map(item => [
            formatPdfText(item.taskTitle || L('na'), language),
            formatPdfText(item.templateName || L('na'), language),
            formatPdfText(item.questionText || L('na'), language),
            formatPdfText(item.response || L('na'), language),
            formatExportDate(item.flaggedAt, language)
          ]);

          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 25,
            head: [orderForLanguage([L('task'), L('template'), L('question'), L('response'), L('date')].map(label => formatPdfText(label, language)), language)],
            body: orderRowsForLanguage(flaggedData, language),
            didParseCell: function (data) {
              localizePdfTable(data, language, fontLoaded);
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
        }
      } catch (error) {
        console.error('Error fetching flagged items for PDF:', error);
      }
    }

    doc.save(`${fileName}.pdf`);
    setShowDocumentModal(false);
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'Completed': return t('tasks.completed');
      case 'Pending': return t('tasks.pending');
      case 'Late': return t('dashboard.late');
      default: return status;
    }
  };

  const pieData = [
    { name: 'Completed', value: data?.charts?.statusDistribution?.completed || 0 },
    { name: 'Pending', value: data?.charts?.statusDistribution?.pending || 0 },
    { name: 'Late', value: data?.charts?.statusDistribution?.late || 0 }
  ].filter(d => d.value > 0);

  const getStatusColor = (statusName) => STATUS_COLORS[statusName] || '#94a3b8';

  // Custom Legend component
  const CustomLegend = ({ payload }) => {
    if (!payload || payload.length === 0) return null;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        marginTop: '16px'
      }}>
        {payload.map((entry, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: entry.color,
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {translateStatus(entry.value)} {entry.payload?.value ?? 0}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading && !data?.stats?.total) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <Loader size={40} />
          <p>{t('common.loading')}</p>
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <ScrollAnimation animation="slideUp">
        <WelcomeText>
          {t('dashboard.welcome')}, {user?.name || t('common.admin')}
        </WelcomeText>
      </ScrollAnimation>

      <ExportRow>
        <ExportButton onClick={() => setShowDocumentModal(true)} data-agent-action="dashboard.export.pdf">
          <Download size={20} />
          {t('dashboard.exportDashboardReport')}
        </ExportButton>
      </ExportRow>

      <DocumentNamingModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onExport={handleConfirmExport}
        exportFormat="pdf"
        documentType="Dashboard-Report"
        defaultCriteria={['documentType', 'currentDate']}
      />

      <ScrollAnimation animation="slideIn" delay={0.1}>
        <StatsGrid>
          <StatCard>
            <div className="icon-wrapper">
              <Calendar color="var(--color-info)" />
            </div>
            <div className="value">{data?.stats?.total || 0}</div>
            <div className="label">{t('dashboard.totalTasks')}</div>
            <StatInsight className="positive">
              ↑ {percentageLabel(data?.stats?.completed)}% {t('dashboard.completionRate', { defaultValue: 'completion rate' })}
            </StatInsight>
          </StatCard>
          <StatCard as="button" type="button" onClick={() => navigate('/tasks?status=archived')} style={{ textAlign: 'left', border: 0, cursor: 'pointer' }}>
            <div className="icon-wrapper">
              <CheckSquare color="var(--color-success)" />
            </div>
            <div className="value">{data?.stats?.completed || 0}</div>
            <div className="label">{t('dashboard.completedTasks')}</div>
            <StatInsight className="positive">
              ↑ {percentageLabel(data?.stats?.completed)}% {t('dashboard.ofTotalTasks', { defaultValue: 'of total tasks' })}
            </StatInsight>
          </StatCard>
          <StatCard as="button" type="button" onClick={() => navigate('/tasks?status=pending')} style={{ textAlign: 'left', border: 0, cursor: 'pointer' }}>
            <div className="icon-wrapper">
              <Clock color="var(--color-warning)" />
            </div>
            <div className="value">{data?.stats?.pending || 0}</div>
            <div className="label">{t('dashboard.pendingTasks')}</div>
            <StatInsight className="warning">
              • {percentageLabel(data?.stats?.pending)}% {t('dashboard.activeTasks', { defaultValue: 'active tasks' })}
            </StatInsight>
          </StatCard>
          <StatCard as="button" type="button" onClick={() => navigate('/tasks?status=delayed')} style={{ textAlign: 'left', border: 0, cursor: 'pointer' }}>
            <div className="icon-wrapper" style={{ backgroundColor: '#fee2e2' }}>
              <Clock color="#ef4444" />
            </div>
            <div className="value">{data?.stats?.delayed || 0}</div>
            <div className="label">{t('dashboard.delayedInspections')}</div>
            <StatInsight className="danger">
              ↓ {percentageLabel(data?.stats?.delayed)}% {t('dashboard.overdueTasksLabel', { defaultValue: 'overdue tasks' })}
            </StatInsight>
          </StatCard>
          <StatCard style={{ position: 'relative' }}>
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
              <Flag color="#f59e0b" />
            </div>
            <div className="value">{data?.stats?.flagged || 0}</div>
            <div className="label">{t('dashboard.flaggedItems')}</div>
            <StatViewButton onClick={() => navigate('/flagged-items')}>
              <Eye size={14} />
              {t('common.viewAll', { defaultValue: 'View All' })}
            </StatViewButton>
          </StatCard>
        </StatsGrid>
      </ScrollAnimation>

      <DashboardFilters onFilterChange={handleFilterChange} />

      <ChartsGrid>
        <ScrollAnimation animation="slideIn" delay={0.2}>
          <ChartCard>
            <SectionHeader>
              <SectionTitle>{t('dashboard.inspectionStatus')}</SectionTitle>
            </SectionHeader>
            <ChartContainer>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    onMouseEnter={(entry) => setHoveredStatus(entry)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                    ))}
                  </Pie>
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
              <DoughnutCenter>
                <strong>{totalTasks}</strong>
                <span>{t('common.total', { defaultValue: 'Total' })}</span>
              </DoughnutCenter>
              {hoveredStatus && (
                <StatusHoverCard role="status" aria-live="polite">
                  <strong>{translateStatus(hoveredStatus.name)}</strong>
                  <span>{t('dashboard.count')}: {hoveredStatus.value}</span>
                </StatusHoverCard>
              )}
            </ChartContainer>
          </ChartCard>
        </ScrollAnimation>

        <ScrollAnimation animation="slideIn" delay={0.3}>
          <ChartCard>
            <SectionHeader>
              <SectionTitle>{t('dashboard.upcomingInspections')}</SectionTitle>
              <SectionAction type="button" onClick={() => navigate('/tasks?status=pending')}>
                {t('common.viewAll', { defaultValue: 'View All' })} →
              </SectionAction>
            </SectionHeader>
            <TableContainer>
              <table>
                <thead>
                  <tr>
                    <th>{t('dashboard.inspectionName')}</th>
                    <th>{t('common.date')}</th>
                    <th>{t('dashboard.assetType')}</th>
                    <th>{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.upcomingInspections || []).length > 0 ? (
                    (data?.upcomingInspections || []).map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td>{item.assetType}</td>
                        <td><span style={{ color: '#b45309', background: '#fff7e0', borderRadius: '999px', padding: '4px 8px', fontSize: 12 }}>{t('dashboard.scheduled', { defaultValue: 'Scheduled' })}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>{t('dashboard.noUpcomingInspections')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableContainer>
          </ChartCard>
        </ScrollAnimation>
      </ChartsGrid>

      <ChartsGrid>
        <ScrollAnimation animation="slideIn" delay={0.6}>
          <ChartCard>
            <SectionHeader>
              <SectionTitle>{t('dashboard.inspectorPerformance')}</SectionTitle>
              <SectionAction type="button" onClick={() => setShowAllInspectors(value => !value)}>
                {showAllInspectors ? t('common.showLess', { defaultValue: 'Show less' }) : t('common.viewAll', { defaultValue: 'View all' })} →
              </SectionAction>
            </SectionHeader>
            <TableContainer>
              {(data?.charts?.inspectorPerformance || []).length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: currentLanguage === 'ar' ? 'right' : 'left' }}>
                        {t('common.inspector')}
                      </th>
                      <th style={{ textAlign: currentLanguage === 'ar' ? 'right' : 'left' }}>
                        <button type="button" onClick={() => toggleSort(setInspectorSort, inspectorSort, 'count')} style={{ border: 0, background: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {t('dashboard.taskCount', { defaultValue: 'Task Count' })} <SortIndicator active={inspectorSort.key === 'count'} direction={inspectorSort.direction} />
                        </button>
                      </th>
                      <th style={{ textAlign: currentLanguage === 'ar' ? 'right' : 'left' }}>
                        <button type="button" onClick={() => toggleSort(setInspectorSort, inspectorSort, 'avgTime')} style={{ border: 0, background: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {t('common.time')} <SortIndicator active={inspectorSort.key === 'avgTime'} direction={inspectorSort.direction} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllInspectors ? sortedInspectors : sortedInspectors.slice(0, 4)).map((item, index) => {
                      return (
                        <tr key={index}>
                          <td style={{
                            fontWeight: 500,
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: currentLanguage === 'ar' ? 'right' : 'left'
                          }} title={item.name}>
                            {item.name}
                          </td>
                          <td style={{
                            textAlign: currentLanguage === 'ar' ? 'right' : 'left',
                            fontWeight: 600,
                            color: '#3b82f6'
                          }}>
                            {formatTaskCount(item.count)}
                          </td>
                          <td style={{ color: '#475569' }}>
                            {formatDuration(item.avgTime)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--color-gray-medium)'
                }}>
                  {t('dashboard.noInspectorData')}
                </div>
              )}
            </TableContainer>
          </ChartCard>
        </ScrollAnimation>

        <ScrollAnimation animation="slideIn" delay={0.7}>
          <ChartCard>
            <SectionHeader>
              <SectionTitle>{t('dashboard.inspectionsPerTemplate')}</SectionTitle>
              <SectionAction type="button" onClick={() => setShowAllTemplates(value => !value)}>
                {showAllTemplates ? t('common.showLess', { defaultValue: 'Show less' }) : t('common.viewAll', { defaultValue: 'View all' })} →
              </SectionAction>
            </SectionHeader>
            <TableContainer>
              {(data?.charts?.templateUsage || []).length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: currentLanguage === 'ar' ? 'right' : 'left' }}>
                        {t('dashboard.templates', { defaultValue: 'Templates' })}
                      </th>
                      <th style={{ textAlign: currentLanguage === 'ar' ? 'right' : 'left' }}>
                        <button type="button" onClick={() => toggleSort(setTemplateSort, templateSort, 'count')} style={{ border: 0, background: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {t('dashboard.count')} <SortIndicator active={templateSort.key === 'count'} direction={templateSort.direction} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllTemplates ? sortedTemplates : sortedTemplates.slice(0, 4)).map((item, index) => {
                      return (
                        <tr key={index}>
                          <td style={{
                            fontWeight: 500,
                            maxWidth: '250px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: currentLanguage === 'ar' ? 'right' : 'left'
                          }} title={item.name}>
                            {item.name}
                          </td>
                          <td style={{
                            textAlign: currentLanguage === 'ar' ? 'right' : 'left',
                            fontWeight: 600,
                            color: '#8b5cf6'
                          }}>
                            {item.count}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--color-gray-medium)'
                }}>
                  {t('dashboard.noTemplateData')}
                </div>
              )}
            </TableContainer>
          </ChartCard>
        </ScrollAnimation>
      </ChartsGrid>


    </DashboardContainer>
  );
};

export default Dashboard;
