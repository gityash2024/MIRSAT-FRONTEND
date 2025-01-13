import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FileText, 
  Filter, 
  Download,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
import ReportHeader from './components/ReportHeader';
import PerformanceMetrics from './components/PerformanceMetrics';
import InspectionStatusChart from './components/InspectionStatusChart';
import TaskCompletionChart from './components/TaskCompletionChart';
import InspectorPerformanceTable from './components/InspectorPerformanceTable';
import TimelineChart from './components/TimelineChart';
import RegionalDistributionMap from './components/RegionalDistributionMap';
import ComplianceChart from './components/ComplianceChart';
import TrendAnalysisChart from './components/TrendAnalysisChart';
import ReportFilters from './components/ReportFilters';

const ReportsContainer = styled.div`
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f5f7fb;
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  margin-top: 24px;
`;

// Grid item wrapper with configurable size
const GridItem = styled.div`
  grid-column: span ${props => props.span || 12};
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 24px;
  display: flex;
  flex-direction: column;

  @media (max-width: 1536px) {
    grid-column: span ${props => Math.min(props.span + 2, 12)};
  }

  @media (max-width: 1280px) {
    grid-column: span ${props => Math.min(props.span + 4, 12)};
  }

  @media (max-width: 1024px) {
    grid-column: span 12;
  }
`;

const Reports = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [selectedFilters, setSelectedFilters] = useState({
    inspectors: [],
    regions: [],
    taskTypes: [],
    status: []
  });

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    // Here you would typically fetch new data based on filters
  };

  return (
    <ReportsContainer>
      <ReportHeader 
        onToggleFilters={() => setShowFilters(!showFilters)}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {showFilters && (
        <ReportFilters 
          filters={selectedFilters}
          onFilterChange={handleFilterChange}
        />
      )}

      <ReportsGrid>
        {/* Performance Metrics Overview */}
        <GridItem span={12}>
          <PerformanceMetrics dateRange={dateRange} />
        </GridItem>

        {/* Main Charts Section */}
        <GridItem span={8}>
          <TaskCompletionChart dateRange={dateRange} />
        </GridItem>

        <GridItem span={4}>
          <InspectionStatusChart />
        </GridItem>

        {/* Inspector Performance */}
        <GridItem span={6}>
          <TrendAnalysisChart dateRange={dateRange} />
        </GridItem>

        <GridItem span={6}>
          <ComplianceChart dateRange={dateRange} />
        </GridItem>

        {/* Regional Distribution Map */}
        <GridItem span={8}>
          <RegionalDistributionMap />
        </GridItem>

        {/* Timeline */}
        <GridItem span={4}>
          <TimelineChart dateRange={dateRange} />
        </GridItem>

        {/* Inspector Performance Table */}
        <GridItem span={12}>
          <InspectorPerformanceTable dateRange={dateRange} />
        </GridItem>
      </ReportsGrid>
    </ReportsContainer>
  );
};

export default Reports;