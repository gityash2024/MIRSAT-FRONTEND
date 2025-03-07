import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  Search, 
  Filter, 
  ArrowDown, 
  ArrowUp, 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  X,
  Camera,
  MessageSquare,
  Save,
  Upload,
  ChevronRight,
  ChevronLeft,
  FileText,
  CheckSquare,
  Square,
  AlertTriangle,
  Calendar,
  Map,
  Tag
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const TasksContainer = styled.div`
  padding: 24px;
  background-color: #f5f7fb;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
`;

const Description = styled.p`
  color: #666;
  font-size: 14px;
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  align-items: center;
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 200px;
  position: relative;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const TasksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
`;

const TaskCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const TaskHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return 'background-color: #fff8e1; color: #f57c00;';
      case 'in_progress':
        return 'background-color: #e1f5fe; color: #0288d1;';
      case 'completed':
        return 'background-color: #e8f5e9; color: #388e3c;';
      case 'incomplete':
        return 'background-color: #ffebee; color: #d32f2f;';
      default:
        return 'background-color: #f5f5f5; color: #616161;';
    }
  }}
`;

const TaskBody = styled.div`
  padding: 16px;
`;

const TaskDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TaskDetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
  
  svg {
    color: #1a237e;
    flex-shrink: 0;
  }
`;

const TaskProgress = styled.div`
  margin: 20px 0;
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .progress-label {
    font-weight: 500;
    color: #333;
  }
  
  .progress-percentage {
    color: #1a237e;
    font-weight: 500;
  }
  
  .progress-bar {
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background-color: #1a237e;
    border-radius: 4px;
    width: ${props => props.progress}%;
  }
`;

const TaskActions = styled.div`
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
`;

const TaskButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  ${props => props.primary ? `
    background-color: #1a237e;
    color: white;
    
    &:hover {
      background-color: #151b4f;
    }
  ` : `
    background-color: #f1f5f9;
    color: #333;
    
    &:hover {
      background-color: #e2e8f0;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyTasks = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  grid-column: 1 / -1;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1a237e;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  
  button {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    
    &.active {
      background-color: #1a237e;
      color: white;
    }
    
    &:not(.active) {
      background-color: #f1f5f9;
      color: #333;
      
      &:hover {
        background-color: #e2e8f0;
      }
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  
  &:hover {
    background-color: #f1f5f9;
    color: #333;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  gap: 24px;
  max-height: calc(90vh - 140px);
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8fafc;
`;

const SidePanel = styled.div`
  width: 280px;
  border-right: 1px solid #e0e0e0;
  padding-right: 24px;
  overflow-y: auto;
`;

const MainPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 16px;
`;

const InspectionLevelList = styled.div`
  margin-bottom: 24px;
`;

const LevelTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const LevelItem = styled.div`
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: ${props => props.active ? '#e3f2fd' : props.completed ? '#e8f5e9' : '#f8fafc'};
  border-left: 3px solid ${props => props.active ? '#1976d2' : props.completed ? '#2e7d32' : '#f8fafc'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#e3f2fd' : '#f1f5f9'};
  }
  
  .level-name {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .level-desc {
    font-size: 13px;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .level-status {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    color: ${props => props.completed ? '#2e7d32' : props.active ? '#1976d2' : '#666'};
  }
`;

const SubLevelItem = styled(LevelItem)`
  padding: 10px 10px 10px 24px;
  border-left: 2px solid ${props => props.active ? '#1976d2' : props.completed ? '#2e7d32' : '#e0e0e0'};
  margin-left: 12px;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    width: 8px;
    height: 2px;
    background-color: ${props => props.active ? '#1976d2' : props.completed ? '#2e7d32' : '#e0e0e0'};
    left: 0;
    top: 50%;
  }

  .level-name {
    font-size: 14px;
  }
`;

const SubSubLevelItem = styled(SubLevelItem)`
  padding-left: 32px;
  margin-left: 24px;
`;

const InspectionPanel = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const InspectionHeader = styled.div`
  margin-bottom: 24px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1a237e;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const InspectionForm = styled.div`
  margin-top: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }
  
  textarea, input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
    }
  }
  
  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8fafc;
  margin-bottom: 8px;
  
  .checkbox {
    margin-right: 12px;
    cursor: pointer;
  }
  
  .item-text {
    flex: 1;
    font-size: 14px;
    color: #333;
  }
`;

const PhotoContainer = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const PhotoItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background-color: #f1f5f9;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .photo-delete {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #d32f2f;
    
    &:hover {
      background-color: white;
    }
  }
`;

const AddPhotoButton = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
  
  &:hover {
    background-color: #f8fafc;
    border-color: #1a237e;
    color: #1a237e;
  }
  
  svg {
    margin-bottom: 4px;
  }
  
  span {
    font-size: 12px;
  }
`;

const ProgressSummary = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .progress-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #1a237e;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
    }
  }
`;

const StatusIcon = ({ status, size = 18 }) => {
  switch (status) {
    case 'pending':
      return <Clock size={size} color="#f57c00" />;
    case 'in_progress':
      return <Activity size={size} color="#0288d1" />;
    case 'completed':
      return <CheckCircle size={size} color="#388e3c" />;
    case 'incomplete':
      return <XCircle size={size} color="#d32f2f" />;
    default:
      return <Clock size={size} color="#616161" />;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getElapsedTime = (startTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const diff = now - start;
  
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  return `${minutes}m`;
};

const UserTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Inspection modal state
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [inspectionLevels, setInspectionLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [levelProgress, setLevelProgress] = useState({});
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [inspectionStartTime, setInspectionStartTime] = useState(null);
  const [levelStartTime, setLevelStartTime] = useState(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    setTimeout(() => {
      setTasks([
        {
          id: 1,
          title: 'Beach Safety Inspection',
          description: 'Conduct a comprehensive safety inspection of the North Beach area, ensuring all safety equipment is functional.',
          status: 'in_progress',
          deadline: '2025-03-10',
          location: 'North Beach',
          progress: 45,
          priority: 'high',
          inspectionLevel: 'Safety Level 2',
          inspectionLevelId: '67b7416253c0bb3bea56e8d1'
        },
        {
          id: 2,
          title: 'Marina Equipment Check',
          description: 'Check all marina equipment including lifeboats, life jackets, and emergency communication devices.',
          status: 'pending',
          deadline: '2025-03-15',
          location: 'West Marina',
          progress: 0,
          priority: 'medium',
          inspectionLevel: 'Operational Level 1',
          inspectionLevelId: '67c558749cf4ccf890a884aa'
        },
        {
          id: 3,
          title: 'Environmental Impact Assessment',
          description: 'Complete the quarterly environmental impact assessment for the harbor area.',
          status: 'completed',
          deadline: '2025-02-28',
          location: 'Harbor Area',
          progress: 100,
          priority: 'medium',
          inspectionLevel: 'Environmental Level 3',
          inspectionLevelId: '67b33be2f4e3b4c9c9c61d00'
        },
        {
          id: 4,
          title: 'Safety Training Verification',
          description: 'Verify that all staff members have completed their mandatory safety training.',
          status: 'pending',
          deadline: '2025-03-20',
          location: 'Main Office',
          progress: 0,
          priority: 'high',
          inspectionLevel: 'Safety Level 1',
          inspectionLevelId: '67b5d72818104d50989e1f04'
        },
        {
          id: 5,
          title: 'Equipment Inventory',
          description: 'Conduct an inventory of all marine equipment and update the central database.',
          status: 'in_progress',
          deadline: '2025-03-12',
          location: 'East Marina',
          progress: 65,
          priority: 'low',
          inspectionLevel: 'Operational Level 2',
          inspectionLevelId: '67c558749cf4ccf890a884aa'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const fetchInspectionLevels = (levelId) => {
    const inspectionLevelsData = {
      '67c558749cf4ccf890a884aa': {
        _id: '67c558749cf4ccf890a884aa',
        name: 'boat service',
        description: 'test description',
        type: 'operational',
        status: 'draft',
        priority: 'medium',
        subLevels: [
          {
            name: 'level 1',
            description: 'level 1 desc',
            order: 0,
            isCompleted: false,
            _id: '67c558749cf4ccf890a884ab',
            subLevels: [
              {
                name: 'level 1 sub level 1',
                description: 'level 1 sub level 1 desc',
                order: 0,
                isCompleted: false,
                _id: '67c558749cf4ccf890a884ac',
                subLevels: [
                  {
                    name: 'level 1 sub level 2',
                    description: 'level 1 sub level 2 desc',
                    order: 0,
                    isCompleted: false,
                    _id: '67c558749cf4ccf890a884ad',
                    subLevels: [],
                    id: '67c558749cf4ccf890a884ad'
                  },
                  {
                    name: 'level 1 sub level 2',
                    description: 'level 1 sub level 2 desc',
                    order: 1,
                    isCompleted: false,
                    _id: '67c558749cf4ccf890a884ae',
                    subLevels: [],
                    id: '67c558749cf4ccf890a884ae'
                  }
                ],
                id: '67c558749cf4ccf890a884ac'
              }
            ],
            id: '67c558749cf4ccf890a884ab'
          },
          {
            name: 'level 2',
            description: 'level 2 desc',
            order: 1,
            isCompleted: false,
            _id: '67c558749cf4ccf890a884af',
            subLevels: [],
            id: '67c558749cf4ccf890a884af'
          }
        ]
      },
      '67b7416253c0bb3bea56e8d1': {
        _id: '67b7416253c0bb3bea56e8d1',
        name: 'Yacht Chartering Checklist',
        description: 'For Yacht Chartering Companies',
        type: 'safety',
        status: 'active',
        priority: 'medium',
        subLevels: [
          {
            name: 'A- Management System',
            description: 'Management System',
            order: 0,
            isCompleted: false,
            _id: '67b7416253c0bb3bea56e8d2',
            subLevels: [],
            id: '67b7416253c0bb3bea56e8d2'
          },
          {
            name: 'B- Infrastructure',
            description: 'Infrastructure',
            order: 1,
            isCompleted: false,
            _id: '67b741b753c0bb3bea56e8f5',
            subLevels: [],
            id: '67b741b753c0bb3bea56e8f5'
          },
          {
            name: 'C- Technical Compliance',
            description: 'Technical Compliance',
            order: 2,
            isCompleted: false,
            _id: '67b741b753c0bb3bea56e8f6',
            subLevels: [],
            id: '67b741b753c0bb3bea56e8f6'
          },
          {
            name: 'D- Customer Services',
            description: 'Customer Services',
            order: 3,
            isCompleted: false,
            _id: '67b741b753c0bb3bea56e8f7',
            subLevels: [],
            id: '67b741b753c0bb3bea56e8f7'
          }
        ]
      },
      '67b5d72818104d50989e1f04': {
        _id: '67b5d72818104d50989e1f04',
        name: 'Maritime Agent Inspection',
        description: 'Maritime Agent Inspection Checklist ',
        type: 'safety',
        status: 'active',
        priority: 'medium',
        subLevels: [
          {
            name: 'A- Managment System',
            description: 'Check Managment system documentation',
            order: 0,
            isCompleted: false,
            _id: '67b5d72818104d50989e1f05',
            subLevels: [],
            id: '67b5d72818104d50989e1f05'
          }
        ]
      },
      '67b33be2f4e3b4c9c9c61d00': {
        _id: '67b33be2f4e3b4c9c9c61d00',
        name: 'Inspection level for cleaning of devices.',
        description: 'Provide clear, detailed objectives of the inspection\n',
        type: 'environmental',
        status: 'draft',
        priority: 'low',
        subLevels: [
          {
            name: 'Test level 1',
            description: 'description demo data.',
            order: 0,
            isCompleted: false,
            _id: '67b33be2f4e3b4c9c9c61d01',
            subLevels: [],
            id: '67b33be2f4e3b4c9c9c61d01'
          }
        ]
      }
    };
    
    return inspectionLevelsData[levelId] || null;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) {
      return false;
    }
    
    if (search && !task.title.toLowerCase().includes(search.toLowerCase()) && 
        !task.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  const startTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setCurrentTask(task);
    
    const inspectionLevel = fetchInspectionLevels(task.inspectionLevelId);
    setInspectionLevels(inspectionLevel);
    
    if (inspectionLevel && inspectionLevel.subLevels.length > 0) {
      setCurrentLevel(inspectionLevel.subLevels[0]);
      
      const initialChecklist = [
        { id: 1, text: 'All safety equipment is present', completed: false },
        { id: 2, text: 'Equipment is in good working condition', completed: false },
        { id: 3, text: 'Emergency procedures are posted', completed: false },
        { id: 4, text: 'Area is clean and hazard-free', completed: false }
      ];
      setChecklist(initialChecklist);
    }
    
    const initialProgress = {};
    if (inspectionLevel && inspectionLevel.subLevels) {
      inspectionLevel.subLevels.forEach(level => {
        initialProgress[level._id] = { status: 'pending', startTime: null, endTime: null };
        
        if (level.subLevels) {
          level.subLevels.forEach(subLevel => {
            initialProgress[subLevel._id] = { status: 'pending', startTime: null, endTime: null };
            
            if (subLevel.subLevels) {
              subLevel.subLevels.forEach(subSubLevel => {
                initialProgress[subSubLevel._id] = { status: 'pending', startTime: null, endTime: null };
              });
            }
          });
        }
      });
    }
    setLevelProgress(initialProgress);
    
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId ? { ...t, status: 'in_progress' } : t
      )
    );
    
    const now = new Date().toISOString();
    setInspectionStartTime(now);
    setLevelStartTime(now);
    
    if (inspectionLevel && inspectionLevel.subLevels.length > 0) {
      const firstLevelId = inspectionLevel.subLevels[0]._id;
      setLevelProgress(prev => ({
        ...prev,
        [firstLevelId]: { ...prev[firstLevelId], status: 'in_progress', startTime: now }
      }));
    }
    
    setInspectionModalOpen(true);
  };
  
  const continueTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setCurrentTask(task);
    
    const inspectionLevel = fetchInspectionLevels(task.inspectionLevelId);
    setInspectionLevels(inspectionLevel);
    
    setLevelStartTime(new Date().toISOString());
    
    let foundIncomplete = false;
    if (inspectionLevel && inspectionLevel.subLevels) {
      for (const level of inspectionLevel.subLevels) {
        if (!level.isCompleted) {
          setCurrentLevel(level);
          foundIncomplete = true;
          break;
        }
        
        if (level.subLevels) {
          for (const subLevel of level.subLevels) {
            if (!subLevel.isCompleted) {
              setCurrentLevel(subLevel);
              foundIncomplete = true;
              break;
            }
            
            if (subLevel.subLevels) {
              for (const subSubLevel of subLevel.subLevels) {
                if (!subSubLevel.isCompleted) {
                  setCurrentLevel(subSubLevel);
                  foundIncomplete = true;
                  break;
                }
              }
            }
            
            if (foundIncomplete) break;
          }
        }
        
        if (foundIncomplete) break;
      }
    }
    
    if (!foundIncomplete && inspectionLevel && inspectionLevel.subLevels.length > 0) {
      setCurrentLevel(inspectionLevel.subLevels[0]);
    }
    
    setLevelProgress({});
    
    setInspectionModalOpen(true);
  };
  
  const viewTaskDetails = (taskId) => {
    console.log(`View task ${taskId} details`);
  };
  
  const handleLevelSelect = (level) => {
    setCurrentLevel(level);
    
    if (levelProgress[level._id]?.status === 'pending') {
      const now = new Date().toISOString();
      setLevelStartTime(now);
      setLevelProgress(prev => ({
        ...prev,
        [level._id]: { ...prev[level._id], status: 'in_progress', startTime: now }
      }));
    }
    
    const initialChecklist = [
      { id: 1, text: 'All safety equipment is present', completed: false },
      { id: 2, text: 'Equipment is in good working condition', completed: false },
      { id: 3, text: 'Emergency procedures are posted', completed: false },
      { id: 4, text: 'Area is clean and hazard-free', completed: false }
    ];
    setChecklist(initialChecklist);
    
    setNotes('');
    setPhotos([]);
  };
  
  const handleChecklistItemToggle = (itemId) => {
    setChecklist(prevChecklist =>
      prevChecklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  const handleAddPhoto = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const photoId = Date.now().toString();
        setPhotos(prevPhotos => [...prevPhotos, { id: photoId, src: e.target.result }]);
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleRemovePhoto = (photoId) => {
    setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
  };
  
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCompleteLevel = () => {
    if (!currentLevel) return;
    
    const now = new Date().toISOString();
    setLevelProgress(prev => ({
      ...prev,
      [currentLevel._id]: { ...prev[currentLevel._id], status: 'completed', endTime: now }
    }));
    
    const totalLevels = Object.keys(levelProgress).length;
    const completedLevels = Object.values(levelProgress).filter(p => p.status === 'completed').length + 1;
    const progress = Math.round((completedLevels / totalLevels) * 100);
    
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === currentTask.id ? { ...task, progress } : task
      )
    );
    
    let nextLevel = null;
    let foundCurrent = false;
    
    const findNextLevel = (levels) => {
      if (nextLevel) return;
      
      for (const level of levels) {
        if (foundCurrent) {
          if (levelProgress[level._id]?.status !== 'completed') {
            nextLevel = level;
            return;
          }
        }
        
        if (level._id === currentLevel._id) {
          foundCurrent = true;
        }
        
        if (level.subLevels && level.subLevels.length > 0) {
          findNextLevel(level.subLevels);
        }
      }
    };
    
    if (inspectionLevels && inspectionLevels.subLevels) {
      findNextLevel(inspectionLevels.subLevels);
    }
    
    if (nextLevel) {
      setCurrentLevel(nextLevel);
      setLevelStartTime(now);
      setLevelProgress(prev => ({
        ...prev,
        [nextLevel._id]: { ...prev[nextLevel._id], status: 'in_progress', startTime: now }
      }));
      
      setNotes('');
      setPhotos([]);
      setChecklist([
        { id: 1, text: 'All safety equipment is present', completed: false },
        { id: 2, text: 'Equipment is in good working condition', completed: false },
        { id: 3, text: 'Emergency procedures are posted', completed: false },
        { id: 4, text: 'Area is clean and hazard-free', completed: false }
      ]);
    } else {
      handleFinishInspection();
    }
  };
  
  const handleFinishInspection = () => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === currentTask.id ? { ...task, status: 'completed', progress: 100 } : task
      )
    );
    
    setInspectionModalOpen(false);
    
    setCurrentTask(null);
    setInspectionLevels([]);
    setCurrentLevel(null);
    setLevelProgress({});
    setNotes('');
    setPhotos([]);
    setChecklist([]);
    setInspectionStartTime(null);
    setLevelStartTime(null);
  };
  
  const calculateCompletedPercentage = () => {
    if (!levelProgress || Object.keys(levelProgress).length === 0) return 0;
    
    const totalLevels = Object.keys(levelProgress).length;
    const completedLevels = Object.values(levelProgress).filter(p => p.status === 'completed').length;
    
    return Math.round((completedLevels / totalLevels) * 100);
  };

  return (
    <TasksContainer>
      <PageHeader>
        <Title>My Tasks</Title>
        <Description>View and manage all your assigned tasks</Description>
      </PageHeader>
      
      <FilterBar>
        <SearchInput>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchInput>
        
        <ButtonGroup>
          <FilterButton onClick={() => setFilter('all')} 
            style={{background: filter === 'all' ? '#e3f2fd' : '#f1f5f9'}}>
            <Filter size={16} />
            All
          </FilterButton>
          <FilterButton onClick={() => setFilter('pending')}
            style={{background: filter === 'pending' ? '#fff8e1' : '#f1f5f9'}}>
            <Clock size={16} />
            Pending
          </FilterButton>
          <FilterButton onClick={() => setFilter('in_progress')}
            style={{background: filter === 'in_progress' ? '#e1f5fe' : '#f1f5f9'}}>
            <Activity size={16} />
            In Progress
          </FilterButton>
          <FilterButton onClick={() => setFilter('completed')}
            style={{background: filter === 'completed' ? '#e8f5e9' : '#f1f5f9'}}>
            <CheckCircle size={16} />
            Completed
          </FilterButton>
        </ButtonGroup>
      </FilterBar>
      
      {loading ? (
        <div>Loading tasks...</div>
      ) : filteredTasks.length > 0 ? (
        <TasksGrid>
          {filteredTasks.map((task) => (
            <TaskCard key={task.id}>
              <TaskHeader>
                <TaskTitle>{task.title}</TaskTitle>
                <StatusBadge status={task.status}>
                  <StatusIcon status={task.status} size={14} />
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                </StatusBadge>
              </TaskHeader>
              
              <TaskBody>
                <TaskDescription>{task.description}</TaskDescription>
                
                <TaskDetailRow>
                  <Clock size={16} />
                  Deadline: {formatDate(task.deadline)}
                </TaskDetailRow>
                
                <TaskDetailRow>
                  <Filter size={16} />
                  Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </TaskDetailRow>
                
                <TaskProgress progress={task.progress}>
                  <div className="progress-header">
                    <span className="progress-label">Completion</span>
                    <span className="progress-percentage">{task.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </TaskProgress>
              </TaskBody>
              
              <TaskActions>
                <TaskButton 
                  onClick={() => viewTaskDetails(task.id)}
                >
                  View Details
                </TaskButton>
                
                {task.status === 'pending' && (
                  <TaskButton 
                    primary
                    onClick={() => startTask(task.id)}
                  >
                    <PlayCircle size={16} />
                    Start Task
                  </TaskButton>
                )}
                
                {task.status === 'in_progress' && (
                  <TaskButton 
                    primary
                    onClick={() => continueTask(task.id)}
                  >
                    <PlayCircle size={16} />
                    Continue
                  </TaskButton>
                )}
              </TaskActions>
            </TaskCard>
          ))}
        </TasksGrid>
      ) : (
        <EmptyTasks>
          <h3>No tasks found</h3>
          <p>No tasks match your current filters. Try adjusting your search criteria.</p>
        </EmptyTasks>
      )}
      
      {filteredTasks.length > 0 && (
        <Pagination>
          <button disabled>&lt;</button>
          <button className="active">1</button>
          <button disabled>&gt;</button>
        </Pagination>
      )}
      
      <ModalOverlay isOpen={inspectionModalOpen} onClick={() => {}}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {currentTask?.title} - Inspection
            </ModalTitle>
            <CloseButton onClick={() => setInspectionModalOpen(false)}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            <SidePanel>
              <InspectionLevelList>
                <LevelTitle>Inspection Levels</LevelTitle>
                
                {inspectionLevels && inspectionLevels.subLevels ? (
                  inspectionLevels.subLevels.map((level) => (
                    <div key={level._id}>
                      <LevelItem 
                        active={currentLevel?._id === level._id}
                        completed={levelProgress[level._id]?.status === 'completed'}
                        onClick={() => handleLevelSelect(level)}
                      >
                        <div className="level-name">
                          {level.name}
                          {levelProgress[level._id]?.status === 'completed' && (
                            <CheckCircle size={16} color="#2e7d32" />
                          )}
                        </div>
                        <div className="level-desc">{level.description}</div>
                        {levelProgress[level._id]?.status !== 'pending' && (
                          <div className="level-status">
                            {levelProgress[level._id]?.status === 'in_progress' ? (
                              <>
                                <Activity size={14} />
                                Started {levelProgress[level._id]?.startTime ? 
                                  getElapsedTime(levelProgress[level._id].startTime) + ' ago' : ''}
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                Completed
                              </>
                            )}
                          </div>
                        )}
                      </LevelItem>
                      
                      {level.subLevels && level.subLevels.map((subLevel) => (
                        <div key={subLevel._id}>
                          <SubLevelItem 
                            active={currentLevel?._id === subLevel._id}
                            completed={levelProgress[subLevel._id]?.status === 'completed'}
                            onClick={() => handleLevelSelect(subLevel)}
                          >
                            <div className="level-name">
                              {subLevel.name}
                              {levelProgress[subLevel._id]?.status === 'completed' && (
                                <CheckCircle size={14} color="#2e7d32" />
                              )}
                            </div>
                            <div className="level-desc">{subLevel.description}</div>
                          </SubLevelItem>
                          
                          {subLevel.subLevels && subLevel.subLevels.map((subSubLevel) => (
                            <SubSubLevelItem 
                              key={subSubLevel._id}
                              active={currentLevel?._id === subSubLevel._id}
                              completed={levelProgress[subSubLevel._id]?.status === 'completed'}
                              onClick={() => handleLevelSelect(subSubLevel)}
                            >
                              <div className="level-name">
                                {subSubLevel.name}
                                {levelProgress[subSubLevel._id]?.status === 'completed' && (
                                  <CheckCircle size={14} color="#2e7d32" />
                                )}
                              </div>
                              <div className="level-desc">{subSubLevel.description}</div>
                            </SubSubLevelItem>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div>No inspection levels found</div>
                )}
              </InspectionLevelList>
              
              <ProgressSummary>
                <h4>Inspection Progress</h4>
                <div className="progress-stats">
                  <div className="stat-item">
                    <div className="stat-value">{calculateCompletedPercentage()}%</div>
                    <div className="stat-label">Completed</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {Object.values(levelProgress).filter(p => p.status === 'completed').length}
                    </div>
                    <div className="stat-label">Levels Done</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">
                      {inspectionStartTime ? getElapsedTime(inspectionStartTime) : '-'}
                    </div>
                    <div className="stat-label">Time Spent</div>
                  </div>
                </div>
                
                <TaskProgress progress={calculateCompletedPercentage()}>
                  <div className="progress-header">
                    <span className="progress-label">Overall Progress</span>
                    <span className="progress-percentage">{calculateCompletedPercentage()}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </TaskProgress>
              </ProgressSummary>
            </SidePanel>
            
            <MainPanel>
              {currentLevel ? (
                <>
                  <InspectionPanel>
                    <InspectionHeader>
                      <h3>{currentLevel.name}</h3>
                      <p>{currentLevel.description}</p>
                      
                      <TaskDetailRow>
                        <Clock size={16} />
                        Started: {levelStartTime ? new Date(levelStartTime).toLocaleTimeString() : 'Not started'}
                      </TaskDetailRow>
                      
                      <TaskDetailRow>
                        <Activity size={16} />
                        Status: {levelProgress[currentLevel._id]?.status === 'in_progress' ? 'In Progress' : 
                                levelProgress[currentLevel._id]?.status === 'completed' ? 'Completed' : 'Pending'}
                      </TaskDetailRow>
                    </InspectionHeader>
                    
                    <InspectionForm>
                      <FormGroup>
                        <label>Inspection Notes</label>
                        <textarea 
                          placeholder="Enter detailed notes about your inspection findings..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                      </FormGroup>
                      
                      <FormGroup>
                        <label>Inspection Checklist</label>
                        {checklist.map((item) => (
                          <ChecklistItem key={item.id}>
                            <div className="checkbox" onClick={() => handleChecklistItemToggle(item.id)}>
                              {item.completed ? (
                                <CheckSquare size={20} color="#1a237e" />
                              ) : (
                                <Square size={20} color="#666" />
                              )}
                            </div>
                            <div className="item-text">{item.text}</div>
                          </ChecklistItem>
                        ))}
                      </FormGroup>
                      
                      <FormGroup>
                        <label>Inspection Photos</label>
                        <PhotoContainer>
                          {photos.map((photo) => (
                            <PhotoItem key={photo.id}>
                              <img src={photo.src} alt="Inspection" />
                              <div className="photo-delete" onClick={() => handleRemovePhoto(photo.id)}>
                                <X size={16} />
                              </div>
                            </PhotoItem>
                          ))}
                          <AddPhotoButton onClick={handleFileInputClick}>
                            <Camera size={24} />
                            <span>Add Photo</span>
                          </AddPhotoButton>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleAddPhoto}
                          />
                        </PhotoContainer>
                      </FormGroup>
                      
                      <TaskButton 
                        primary 
                        style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }}
                        onClick={handleCompleteLevel}
                      >
                        {Object.values(levelProgress).filter(p => p.status === 'completed').length + 1 >= Object.keys(levelProgress).length ? 
                          'Complete Inspection' : 'Complete & Continue'}
                      </TaskButton>
                    </InspectionForm>
                  </InspectionPanel>
                  
                  <InspectionPanel>
                    <InspectionHeader>
                      <h3>Task Details</h3>
                    </InspectionHeader>
                    
                    <TaskDetailRow>
                      <Calendar size={16} />
                      Deadline: {formatDate(currentTask?.deadline)}
                    </TaskDetailRow>
                    
                    <TaskDetailRow>
                      <Tag size={16} />
                      Priority: {currentTask?.priority?.charAt(0).toUpperCase() + currentTask?.priority?.slice(1)}
                    </TaskDetailRow>
                    
                    <TaskDetailRow>
                      <Map size={16} />
                      Location: {currentTask?.location}
                    </TaskDetailRow>
                    
                    <TaskDetailRow>
                      <FileText size={16} />
                      Description: {currentTask?.description}
                    </TaskDetailRow>
                  </InspectionPanel>
                </>
              ) : (
                <div>Select an inspection level to begin</div>
              )}
            </MainPanel>
          </ModalBody>
          
          <ModalFooter>
            <TaskButton onClick={() => setInspectionModalOpen(false)}>
              Save & Exit
            </TaskButton>
            
            <TaskDetailRow style={{ margin: 0 }}>
              <Clock size={16} />
              Total time: {inspectionStartTime ? getElapsedTime(inspectionStartTime) : '-'}
            </TaskDetailRow>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>
    </TasksContainer>
  );
};

export default UserTasks;