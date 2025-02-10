import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search, Download, Layers, ChevronRight, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import InspectionLevelFilters from './InspectionLevelFilters';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
    }
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  cursor: pointer;
  text-decoration: none;

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
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LevelGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const LevelCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const LevelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const LevelInfo = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const LevelIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e3f2fd;
  color: #1a237e;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LevelDetails = styled.div`
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1a237e;
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    color: #666;
  }
`;

const LevelActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f7fb;
    color: #1a237e;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SubLevelsList = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const SubLevel = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SubLevelIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f3e5f5;
  color: #9c27b0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #666;

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: #1a237e;
  }

  p {
    margin-bottom: 16px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 0;
  color: #1a237e;
`;

const InspectionLevelList = ({ loading, setLoading, handleError, inspectionService }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: [],
    status: [],
    priority: []
  });
  const [inspectionLevels, setInspectionLevels] = useState([]);

  useEffect(() => {
    fetchInspectionLevels();
  }, [filters]);

  const fetchInspectionLevels = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchTerm
      };
      const response = await inspectionService.getInspectionLevels(params);
      setInspectionLevels(response.results || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.key === 'Enter') {
      fetchInspectionLevels();
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inspection level?')) {
      return;
    }

    try {
      setLoading(true);
      await inspectionService.deleteInspectionLevel(id);
      toast.success('Inspection level deleted successfully');
      fetchInspectionLevels();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <PageContainer>
      <Header>
        <PageTitle>
          <Layers size={24} />
          Inspection Levels
        </PageTitle>
        <SubTitle>Manage inspection levels and their hierarchies</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search inspection levels..." 
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={(e) => e.key === 'Enter' && fetchInspectionLevels()}
            disabled={loading}
          />
        </SearchBox>

        <ButtonGroup>
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
          >
            <Filter size={18} />
            Filters
          </Button>
          <Button 
            variant="secondary"
            disabled={loading}
          >
            <Download size={18} />
            Export
          </Button>
          <Button 
            variant="primary" 
            as={Link} 
            to="/inspection/create"
            disabled={loading}
          >
            <Plus size={18} />
            Add Level
          </Button>
        </ButtonGroup>
      </ActionBar>

      {showFilters && (
        <InspectionLevelFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
          loading={loading}
        />
      )}

      {loading ? (
        <LoadingSpinner>Loading...</LoadingSpinner>
      ) : inspectionLevels.length === 0 ? (
        <EmptyState>
          <h3>No Inspection Levels Found</h3>
          <p>Create your first inspection level to get started</p>
          <Button 
            variant="primary" 
            as={Link} 
            to="/inspection/create"
          >
            <Plus size={18} />
            Add Level
          </Button>
        </EmptyState>
      ) : (
        <LevelGrid>
          {inspectionLevels.map(level => (
            <LevelCard key={level._id}>
              <LevelHeader>
                <LevelInfo>
                  <LevelIcon>
                    <Layers size={20} />
                  </LevelIcon>
                  <LevelDetails>
                    <h3>{level.name}</h3>
                    <p>{level.description}</p>
                  </LevelDetails>
                </LevelInfo>
                <LevelActions>
                  <ActionButton 
                    as={Link} 
                    to={`/inspection/${level._id}`}
                    disabled={loading}
                  >
                    <Eye size={16} />
                  </ActionButton>
                  <ActionButton 
                    as={Link} 
                    to={`/inspection/${level._id}/edit`}
                    disabled={loading}
                  >
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton 
                    onClick={() => handleDelete(level._id)}
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </LevelActions>
              </LevelHeader>

              <SubLevelsList>
                {level.subLevels?.map(subLevel => (
                  <SubLevel key={subLevel._id}>
                    <SubLevelIcon>
                      <ChevronRight size={16} />
                    </SubLevelIcon>
                    <span>{subLevel.name}</span>
                  </SubLevel>
                ))}
              </SubLevelsList>
            </LevelCard>
          ))}
        </LevelGrid>
      )}
    </PageContainer>
  );
};

export default InspectionLevelList;