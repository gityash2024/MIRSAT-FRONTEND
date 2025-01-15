import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  BarChart2,
  Filter,
  Download
} from 'lucide-react';
import { inspectorPerformance } from '../mockData';

const TableContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  height: 100%;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  position: relative;
  width: 300px;

  input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    color: #1a237e;

    &:focus {
      outline: none;
      border-color: #1a237e;
    }
  }

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;

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
      background: #f8fafc;
    }
  `}
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #1a237e;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f59e0b;
`;

const PerformanceIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.trend > 0 ? '#16a34a' : '#dc2626'};
  font-weight: 500;
`;

const Progress = styled.div`
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: ${props => {
    if (props.value >= 90) return '#16a34a';
    if (props.value >= 70) return '#2563eb';
    if (props.value >= 50) return '#f59e0b';
    return '#dc2626';
  }};
  width: ${props => props.value}%;
  transition: width 0.3s ease;
`;

const ActivityChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 32px;
`;

const ActivityBar = styled.div`
  width: 4px;
  height: ${props => (props.value / props.max) * 100}%;
  background: ${props => props.color};
  border-radius: 2px;
`;

const InspectorPerformanceTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tasksCompleted');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...inspectorPerformance].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    return (a[sortBy] - b[sortBy]) * order;
  });

  const filteredData = sortedData.filter(inspector =>
    inspector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TableContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Users size={20} />
          Inspector Performance
        </Title>
        <Subtitle>Detailed performance metrics for all inspectors</Subtitle>
      </Header>

      <TableControls>
        <SearchBar>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search inspectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>

        <ActionButtons>
          <Button>
            <Filter size={16} />
            Filter
          </Button>
          <Button>
            <Download size={16} />
            Export
          </Button>
          <Button variant="primary">
            <BarChart2 size={16} />
            Generate Report
          </Button>
        </ActionButtons>
      </TableControls>

      <Table>
        <thead>
          <tr>
            <Th>Inspector Name</Th>
            <Th>Tasks Completed</Th>
            <Th>Avg. Completion Time</Th>
            <Th>Compliance Rate</Th>
            <Th>Rating</Th>
            <Th>Recent Activity</Th>
            <Th>Performance Trend</Th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((inspector) => {
            const maxActivity = Math.max(...inspector.recentActivity.map(a => a.count));
            return (
              <tr key={inspector.id}>
                <Td style={{ fontWeight: 500, color: '#1a237e' }}>
                  {inspector.name}
                </Td>
                <Td>{inspector.tasksCompleted}</Td>
                <Td>{inspector.avgCompletionTime} hours</Td>
                <Td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>{inspector.complianceRate}%</span>
                    <Progress>
                      <ProgressBar value={inspector.complianceRate} />
                    </Progress>
                  </div>
                </Td>
                <Td>
                  <Rating>
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill={index < Math.floor(inspector.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                    <span style={{ marginLeft: '4px', color: '#64748b' }}>
                      {inspector.rating}
                    </span>
                  </Rating>
                </Td>
                <Td>
                  <ActivityChart>
                    {inspector.recentActivity.map((activity, index) => (
                      <ActivityBar
                        key={index}
                        value={activity.count}
                        max={maxActivity}
                        color={
                          activity.type === 'Beach' ? '#2563eb' :
                          activity.type === 'Marina' ? '#16a34a' :
                          '#9333ea'
                        }
                        title={`${activity.type}: ${activity.count} tasks`}
                      />
                    ))}
                  </ActivityChart>
                </Td>
                <Td>
                  <PerformanceIndicator trend={Math.random() > 0.5 ? 1 : -1}>
                    {Math.random() > 0.5 ? (
                      <>
                        <ArrowUpRight size={16} />
                        +{(Math.random() * 10).toFixed(1)}%
                      </>
                    ) : (
                      <>
                        <ArrowDownRight size={16} />
                        -{(Math.random() * 10).toFixed(1)}%
                      </>
                    )}
                  </PerformanceIndicator>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default InspectorPerformanceTable;