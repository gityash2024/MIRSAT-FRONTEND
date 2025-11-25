import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Calendar,
  CheckSquare,
  Clock,
  AlertTriangle,
  Flag,
  Download,
  Loader
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ScrollAnimation from '../components/common/ScrollAnimation';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import { useTranslation } from 'react-i18next';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  
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
  min-height: 400px;
  display: flex;
  flex-direction: column;
`;

const SmallCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
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

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Completed (Green), Pending (Orange), Late (Red)

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Dashboard Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    // Stats
    const statsData = [
      ['Total Tasks', data?.stats?.total || 0],
      ['Completed Tasks', data?.stats?.completed || 0],
      ['Pending Tasks', data?.stats?.pending || 0],
      ['Delayed Inspections', data?.stats?.delayed || 0],
      ['Flagged Items', data?.stats?.flagged || 0]
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: statsData,
    });

    // Upcoming Inspections
    doc.text("Upcoming Inspections", 14, doc.lastAutoTable.finalY + 15);

    const upcomingData = (data?.upcomingInspections || []).map(item => [
      item.name,
      new Date(item.date).toLocaleDateString(),
      item.assetType
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Inspection Name', 'Date', 'Asset Type']],
      body: upcomingData,
    });

    doc.save("dashboard_report.pdf");
  };

  const pieData = [
    { name: 'Completed', value: data?.charts?.statusDistribution?.completed || 0 },
    { name: 'Pending', value: data?.charts?.statusDistribution?.pending || 0 },
    { name: 'Late', value: data?.charts?.statusDistribution?.late || 0 }
  ].filter(d => d.value > 0);

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

      <DashboardFilters onFilterChange={handleFilterChange} />

      <ExportRow>
        <ExportButton onClick={handleExport}>
          <Download size={20} />
          {t('dashboard.exportDashboardReport')}
        </ExportButton>
      </ExportRow>

      <ScrollAnimation animation="slideIn" delay={0.1}>
        <StatsGrid>
          <StatCard>
            <div className="icon-wrapper">
              <Calendar color="var(--color-info)" />
            </div>
            <div className="value">{data?.stats?.total || 0}</div>
            <div className="label">{t('dashboard.totalTasks')}</div>
          </StatCard>
          <StatCard>
            <div className="icon-wrapper">
              <CheckSquare color="var(--color-success)" />
            </div>
            <div className="value">{data?.stats?.completed || 0}</div>
            <div className="label">{t('dashboard.completedTasks')}</div>
          </StatCard>
          <StatCard>
            <div className="icon-wrapper">
              <Clock color="var(--color-warning)" />
            </div>
            <div className="value">{data?.stats?.pending || 0}</div>
            <div className="label">{t('dashboard.pendingTasks')}</div>
          </StatCard>
        </StatsGrid>
      </ScrollAnimation>

      <ChartsGrid>
        <ScrollAnimation animation="slideIn" delay={0.2}>
          <ChartCard>
            <SectionTitle>{t('dashboard.inspectionStatus')}</SectionTitle>
            <ResponsiveContainer width="100%" height={300}>
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
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </ScrollAnimation>

        <ScrollAnimation animation="slideIn" delay={0.3}>
          <ChartCard>
            <SectionTitle>{t('dashboard.upcomingScheduledInspections')}</SectionTitle>
            <TableContainer>
              <table>
                <thead>
                  <tr>
                    <th>{t('dashboard.inspectionName')}</th>
                    <th>{t('common.date')}</th>
                    <th>{t('dashboard.assetType')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.upcomingInspections || []).length > 0 ? (
                    (data?.upcomingInspections || []).map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td>{item.assetType}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center' }}>{t('dashboard.noUpcomingInspections')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableContainer>
          </ChartCard>
        </ScrollAnimation>
      </ChartsGrid>

      <SmallCardsGrid>
        <ScrollAnimation animation="slideIn" delay={0.4}>
          <StatCard>
            <div className="icon-wrapper" style={{ backgroundColor: '#fee2e2' }}>
              <Clock color="#ef4444" />
            </div>
            <div className="value">{data?.stats?.delayed || 0}</div>
            <div className="label">{t('dashboard.delayedInspections')}</div>
          </StatCard>
        </ScrollAnimation>
        <ScrollAnimation animation="slideIn" delay={0.5}>
          <StatCard>
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
              <Flag color="#f59e0b" />
            </div>
            <div className="value">{data?.stats?.flagged || 0}</div>
            <div className="label">{t('dashboard.flaggedItems')}</div>
          </StatCard>
        </ScrollAnimation>
      </SmallCardsGrid>

      <ChartsGrid>
        <ScrollAnimation animation="slideIn" delay={0.6}>
          <ChartCard>
            <SectionTitle>{t('dashboard.inspectorPerformanceAvgDuration')}</SectionTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.charts?.inspectorPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name={t('dashboard.inspections')} />
                <Bar dataKey="avgTime" fill="#10b981" name={t('dashboard.avgDurationMin')} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </ScrollAnimation>

        <ScrollAnimation animation="slideIn" delay={0.7}>
          <ChartCard>
            <SectionTitle>{t('dashboard.inspectionsPerTemplate')}</SectionTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.charts?.templateUsage || []} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name={t('dashboard.count')} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </ScrollAnimation>
      </ChartsGrid>


    </DashboardContainer>
  );
};

export default Dashboard;