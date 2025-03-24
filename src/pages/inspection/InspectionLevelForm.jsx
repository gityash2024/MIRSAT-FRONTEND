import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Minus, Move, Layers, ChevronDown, ChevronRight,
  List, PlusCircle, X, HelpCircle, AlertTriangle, CheckCircle, BookOpen, Save
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';
import { inspectionService } from '../../services/inspection.service';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuestionLibrary,
  addQuestionToLibrary,
  deleteQuestionFromLibrary
} from '../../store/slices/questionLibrarySlice';
import { updateInspectionLevel } from '../../store/slices/inspectionLevelSlice';
import Skeleton from '../../components/ui/Skeleton';

const PageContainer = styled.div`
  padding: 24px;
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
  margin-bottom: 16px;
  
  &:hover {
    color: #333;
  }
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

const Form = styled.form`
  display: grid;
  gap: 24px;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const SubLevelsContainer = styled.div`
  margin-top: 16px;
`;

const SubLevelItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.isDragging ? '#f1f5f9' : '#f8fafc'};
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid ${props => props.isDragging ? '#1a237e' : '#e0e0e0'};
`;

const DragHandle = styled.div`
  cursor: grab;
  color: #666;
  
  &:hover {
    color: #1a237e;
  }
`;

const SubLevelInput = styled(Input)`
  flex: 1;
`;

const IconButton = styled.button`
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
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`;

const NestedSubLevelsContainer = styled.div`
  margin-left: 40px;
  margin-top: 8px;
`;

const ExpandCollapseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #1a237e;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px 0;
  color: #1a237e;
  gap: 12px;
  
  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #1a237e;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Add new styled components for questionnaire functionality
const QuestionnaireSection = styled(FormSection)`
  margin-top: 20px;
`;

const QuestionItem = styled.div`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const QuestionTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const QuestionForm = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const OptionsContainer = styled.div`
  margin-top: 12px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 16px;
  
  &:hover {
    background: #3949ab;
  }
  
  &:disabled {
    background: #9fa8da;
    cursor: not-allowed;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  
  input {
    cursor: pointer;
  }
  
  &:hover {
    color: #1a237e;
  }
`;

// Add these styled components for the question library
const QuestionLibraryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f5ff;
  border: 1px solid #d0e1ff;
  color: #1a237e;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #d0e1ff;
  }
`;

const QuestionLibraryModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const QuestionLibraryContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
`;

const QuestionLibraryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const QuestionLibraryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin: 0;
`;

const QuestionLibraryClose = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #1a237e;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #1a237e;
  }
`;

const QuestionLibraryList = styled.div`
  display: grid;
  gap: 12px;
`;

const QuestionLibraryItem = styled.div`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f5ff;
    border-color: #d0e1ff;
  }
`;

const QuestionLibraryItemContent = styled.div`
  margin-bottom: 8px;
`;

const QuestionLibraryItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
`;

const QuestionLibraryEmpty = styled.div`
  text-align: center;
  padding: 32px 0;
  color: #64748b;
`;

const SaveToLibraryButton = styled.button`
  background: none;
  border: none;
  color: #1a237e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  
  &:hover {
    background: #f0f5ff;
  }
`;

// The main SubLevel component that handles a single level item
const SubLevelRow = ({ 
  level, 
  parentPath = "",
  onSubLevelChange, 
  onRemoveSubLevel, 
  onAddNestedSubLevel, 
  loading,
  dragHandleProps 
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasNestedLevels = level.subLevels && level.subLevels.length > 0;
  const path = parentPath ? `${parentPath}.${level.id}` : `${level.id}`;
  
  return (
    <>
      <SubLevelItem isDragging={false}>
        <DragHandle {...dragHandleProps}>
          <Move size={16} />
        </DragHandle>
        
        {hasNestedLevels && (
          <ExpandCollapseButton 
            onClick={() => setExpanded(!expanded)} 
            type="button"
            disabled={loading}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </ExpandCollapseButton>
        )}
        
        <SubLevelInput
          type="text"
          value={level.name || ""}
          onChange={(e) => onSubLevelChange(path, 'name', e.target.value)}
          placeholder="Enter sub-level name"
          disabled={loading}
        />
        
        <SubLevelInput
          type="text"
          value={level.description || ""}
          onChange={(e) => onSubLevelChange(path, 'description', e.target.value)}
          placeholder="Enter sub-level description"
          disabled={loading}
        />
        
        <IconButton
          type="button"
          onClick={() => onAddNestedSubLevel(path)}
          disabled={loading}
        >
          <Plus size={16} />
        </IconButton>
        
        <IconButton
          type="button"
          onClick={() => onRemoveSubLevel(path)}
          disabled={loading}
        >
          <Minus size={16} />
        </IconButton>
      </SubLevelItem>
      
      {expanded && hasNestedLevels && (
        <NestedSubLevelsContainer>
          <NestedSubLevelsList
            subLevels={level.subLevels}
            parentPath={path}
            onSubLevelChange={onSubLevelChange}
            onRemoveSubLevel={onRemoveSubLevel}
            onAddNestedSubLevel={onAddNestedSubLevel}
            loading={loading}
          />
        </NestedSubLevelsContainer>
      )}
    </>
  );
};

// Component to render a nested droppable list of sub-levels
const NestedSubLevelsList = ({ 
  subLevels, 
  parentPath, 
  onSubLevelChange, 
  onRemoveSubLevel, 
  onAddNestedSubLevel, 
  loading 
}) => {
  const droppableId = `nested-${parentPath || "root"}`;
  
  return (
    <Droppable droppableId={droppableId} type={droppableId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {subLevels.map((subLevel, index) => (
            <Draggable
              key={`${parentPath}-${subLevel.id}`}
              draggableId={`${parentPath}-${subLevel.id}`}
              index={index}
              isDragDisabled={loading}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                >
                  <SubLevelRow
                    level={subLevel}
                    parentPath={parentPath}
                    onSubLevelChange={onSubLevelChange}
                    onRemoveSubLevel={onRemoveSubLevel}
                    onAddNestedSubLevel={onAddNestedSubLevel}
                    loading={loading}
                    dragHandleProps={provided.dragHandleProps}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

// Create InspectionLevelSkeleton component
const InspectionLevelSkeleton = () => (
  <PageContainer>
    <Skeleton.Base width="150px" height="20px" margin="0 0 16px 0" />
    
    <Header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Skeleton.Circle size="24px" />
        <Skeleton.Base width="300px" height="28px" />
      </div>
      <Skeleton.Base width="70%" height="16px" margin="0 0 24px 0" />
    </Header>
    
    <Skeleton.Form.Field marginBottom="24px">
      <Skeleton.Form.Label width="80px" />
      <Skeleton.Form.Input height="42px" />
    </Skeleton.Form.Field>
    
    <Skeleton.Form.Field marginBottom="24px">
      <Skeleton.Form.Label width="100px" />
      <Skeleton.Form.Input height="120px" />
    </Skeleton.Form.Field>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
      <Skeleton.Form.Field>
        <Skeleton.Form.Label width="60px" />
        <Skeleton.Form.Input height="42px" />
      </Skeleton.Form.Field>
      <Skeleton.Form.Field>
        <Skeleton.Form.Label width="70px" />
        <Skeleton.Form.Input height="42px" />
      </Skeleton.Form.Field>
      <Skeleton.Form.Field>
        <Skeleton.Form.Label width="80px" />
        <Skeleton.Form.Input height="42px" />
      </Skeleton.Form.Field>
    </div>
    
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Skeleton.Base width="200px" height="24px" />
      </div>
      
      {/* Sublevels skeleton */}
      <Skeleton.Card.Wrapper>
        <Skeleton.Card.Header>
          <Skeleton.Base width="40%" height="20px" />
        </Skeleton.Card.Header>
        
        {Array(3).fill().map((_, i) => (
          <div key={i} style={{ padding: '12px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '60%' }}>
              <Skeleton.Circle size="24px" />
              <Skeleton.Base width="80%" height="20px" />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Skeleton.Base width="24px" height="24px" radius="4px" />
              <Skeleton.Base width="24px" height="24px" radius="4px" />
              <Skeleton.Base width="24px" height="24px" radius="4px" />
            </div>
          </div>
        ))}
      </Skeleton.Card.Wrapper>
    </div>
    
    {/* Questionnaire section skeleton */}
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Skeleton.Base width="280px" height="24px" />
      </div>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <Skeleton.Button width="140px" height="36px" />
        <Skeleton.Button width="160px" height="36px" />
      </div>
      
      {Array(2).fill().map((_, i) => (
        <Skeleton.Card.Wrapper key={i} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #edf2f7' }}>
            <Skeleton.Base width="150px" height="20px" />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Skeleton.Base width="80px" height="30px" radius="4px" />
              <Skeleton.Base width="30px" height="30px" radius="4px" />
            </div>
          </div>
          
          <Skeleton.Form.Field>
            <Skeleton.Form.Label width="120px" />
            <Skeleton.Form.Input height="42px" />
          </Skeleton.Form.Field>
          
          <Skeleton.Form.Field>
            <Skeleton.Form.Label width="100px" />
            <Skeleton.Form.Input height="42px" />
          </Skeleton.Form.Field>
        </Skeleton.Card.Wrapper>
      ))}
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
      <Skeleton.Button width="90px" />
      <Skeleton.Button width="120px" />
    </div>
  </PageContainer>
);

const InspectionLevelForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  
  // Get question library from Redux store
  const { 
    questions: questionLibrary, 
    loading: libraryLoading 
  } = useSelector(state => state.questionLibrary);
  
  // Add this function for error handling
  const handleError = (error) => {
    console.error('Error details:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      console.error('Error status:', status);
      console.error('Error response:', data);
      
      errorMessage = data?.message || `Server error (${status})`;
      
      // Handle 404 errors specifically
      if (status === 404) {
        errorMessage = `Resource not found: ${data?.message || 'The requested resource could not be found'}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'Network error: No response received from server';
    } else if (typeof error === 'string') {
      // Direct string error
      errorMessage = error;
    } else if (error.message) {
      // Error message property
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'safety',
    status: 'active',
    priority: 'medium',
    subLevels: [{ id: Date.now(), name: '', description: '', order: 0, subLevels: [] }]
  });
  
  const [errors, setErrors] = useState({});
  
  // Add new state for questionnaire
  const [questions, setQuestions] = useState([]);

  // Question library management
  const [showQuestionLibrary, setShowQuestionLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      fetchInspectionLevel();
    }
  }, [id]);

  // Add useEffect to load question library from API
  useEffect(() => {
    dispatch(fetchQuestionLibrary());
  }, [dispatch]);

  const fetchInspectionLevel = async () => {
    try {
      setInitialLoading(true);
      const data = await inspectionService.getInspectionLevel(id);
      
      // Process sublevel data - ensure each has an id and subLevels array
      const processSubLevels = (subLevels) => {
        return (subLevels || []).map(sl => ({
          ...sl,
          id: sl.id || sl._id || Date.now(),
          subLevels: processSubLevels(sl.subLevels)
        }));
      };
      
      const processedData = {
        ...data,
        subLevels: processSubLevels(data.subLevels)
      };
      
      setFormData(processedData);
      
      // Add this line to set questions state from the API response
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching inspection level:', error);
      handleError(error);
      navigate('/inspection');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle change in sublevel fields
  const handleSubLevelChange = (path, field, value) => {
    setFormData(prev => {
      // Handle top-level sublevels
      if (!path.includes('.')) {
        return {
          ...prev,
          subLevels: prev.subLevels.map(level => 
            level.id.toString() === path ? { ...level, [field]: value } : level
          )
        };
      }
      
      // Handle nested sublevels
      const newFormData = JSON.parse(JSON.stringify(prev)); // Deep clone
      const parts = path.split('.');
      
      // Traverse to the target sublevel
      let current = newFormData.subLevels;
      let target = null;
      
      for (const part of parts) {
        // Find the sublevel with matching id in the current level
        const sublevel = current.find(sl => sl.id.toString() === part);
        if (!sublevel) return prev; // Path not found
        
        if (part === parts[parts.length - 1]) {
          // This is the target sublevel
          target = sublevel;
        } else {
          // Move to the next level
          current = sublevel.subLevels || [];
        }
      }
      
      if (target) {
        target[field] = value;
      }
      
      return newFormData;
    });
  };

  // Add a new top-level sublevel
  const addSubLevel = () => {
    setFormData(prev => ({
      ...prev,
      subLevels: [
        ...prev.subLevels,
        { 
          id: Date.now(), 
          name: '', 
          description: '', 
          order: prev.subLevels.length,
          subLevels: []
        }
      ]
    }));
  };

  // Add a nested sublevel to a parent
  const addNestedSubLevel = (parentPath) => {
    setFormData(prev => {
      const newFormData = JSON.parse(JSON.stringify(prev)); // Deep clone
      
      if (!parentPath) {
        // Add to top level if no parent path
        newFormData.subLevels.push({
          id: Date.now(),
          name: '',
          description: '',
          order: newFormData.subLevels.length,
          subLevels: []
        });
        return newFormData;
      }
      
      const parts = parentPath.split('.');
      let current = newFormData.subLevels;
      
      // Traverse to the parent sublevel
      for (const part of parts) {
        const sublevel = current.find(sl => sl.id.toString() === part);
        if (!sublevel) return prev; // Path not found
        
        // Initialize subLevels array if it doesn't exist
        if (!sublevel.subLevels) {
          sublevel.subLevels = [];
        }
        
        if (part === parts[parts.length - 1]) {
          // This is the parent sublevel, add a new child
          sublevel.subLevels.push({
            id: Date.now(),
            name: '',
            description: '',
            order: sublevel.subLevels.length,
            subLevels: []
          });
        } else {
          // Move to the next level
          current = sublevel.subLevels;
        }
      }
      
      return newFormData;
    });
  };

  // Remove a sublevel
  const removeSubLevel = (path) => {
    if (!path) return;
    
    setFormData(prev => {
      // Don't remove if it's the last remaining top-level sublevel
      if (!path.includes('.') && prev.subLevels.length <= 1) {
        return prev;
      }
      
      const newFormData = JSON.parse(JSON.stringify(prev)); // Deep clone
      const parts = path.split('.');
      
      if (parts.length === 1) {
        // Remove from top level
        newFormData.subLevels = newFormData.subLevels.filter(
          sl => sl.id.toString() !== parts[0]
        );
        return newFormData;
      }
      
      // For nested levels, we need to find the parent
      const parentPath = parts.slice(0, -1);
      let current = newFormData.subLevels;
      let parent = null;
      
      // Traverse to the parent sublevel
      for (let i = 0; i < parentPath.length; i++) {
        const part = parentPath[i];
        const sublevel = current.find(sl => sl.id.toString() === part);
        if (!sublevel) return prev; // Path not found
        
        if (i === parentPath.length - 1) {
          // This is the parent sublevel
          parent = sublevel;
        } else {
          // Move to the next level
          current = sublevel.subLevels || [];
        }
      }
      
      if (parent && parent.subLevels) {
        // Remove the target sublevel from the parent's subLevels
        parent.subLevels = parent.subLevels.filter(
          sl => sl.id.toString() !== parts[parts.length - 1]
        );
      }
      
      return newFormData;
    });
  };

  // Handle drag and drop within the same list
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Handle reordering within the same droppable
    if (source.droppableId === destination.droppableId) {
      // Root level drag
      if (type === 'subLevels' || source.droppableId === 'subLevels') {
        setFormData(prev => {
          const newSubLevels = [...prev.subLevels];
          const [reorderedItem] = newSubLevels.splice(source.index, 1);
          newSubLevels.splice(destination.index, 0, reorderedItem);
          
          return {
            ...prev,
            subLevels: newSubLevels.map((item, index) => ({ ...item, order: index }))
          };
        });
      } 
      // Nested level drag - more complex
      else {
        // Extract the parent path from the droppableId
        const parentPath = source.droppableId.replace('nested-', '');
        
        setFormData(prev => {
          const newFormData = JSON.parse(JSON.stringify(prev)); // Deep clone
          
          // Find the parent's subLevels array
          const parts = parentPath.split('.');
          let current = newFormData.subLevels;
          let target = null;
          
          for (const part of parts) {
            const sublevel = current.find(sl => sl.id.toString() === part);
            if (!sublevel) return prev; // Path not found
            
            target = sublevel;
            current = sublevel.subLevels || [];
          }
          
          if (target && target.subLevels) {
            // Reorder the items
            const [reorderedItem] = target.subLevels.splice(source.index, 1);
            target.subLevels.splice(destination.index, 0, reorderedItem);
            
            // Update order properties
            target.subLevels = target.subLevels.map((item, index) => ({
              ...item,
              order: index
            }));
          }
          
          return newFormData;
        });
      }
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    // Check basic fields
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    
    // Check all sublevel fields recursively
    const validateSubLevels = (subLevels) => {
      for (const level of subLevels) {
        if (!level.name || !level.description) {
          return false;
        }
        if (level.subLevels && level.subLevels.length > 0) {
          if (!validateSubLevels(level.subLevels)) {
            return false;
          }
        }
      }
      return true;
    };
    
    if (!validateSubLevels(formData.subLevels)) {
      newErrors.subLevels = 'All sub-levels must have names and descriptions';
    }
    
    // Add validation for questions
    let isValid = true;
    
    // Check if all questions have text
    const emptyQuestions = questions.filter(q => !q.text.trim());
    if (emptyQuestions.length > 0) {
      toast.error('All questions must have text');
      isValid = false;
    }
    
    // Check if all questions of type 'select' or 'multiple_choice' have at least one option
    const invalidOptions = questions.filter(q => 
      (q.answerType === 'select' || q.answerType === 'multiple_choice') && 
      (!Array.isArray(q.options) || q.options.length === 0 || 
       q.options.some(opt => !opt.trim()))
    );
    
    if (invalidOptions.length > 0) {
      toast.error('All select and multiple choice questions must have at least one option');
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    try {
      setLoading(true);
      
      // Prepare data for API (handle any transformations needed)
      const apiData = {
        ...formData,
        subLevels: formData.subLevels,
        questions: questions
      };
      
      if (id) {
        console.log('Updating inspection level with ID:', id);
        console.log('Update payload:', JSON.stringify(apiData, null, 2));
        
        // Use Redux action instead of direct service call
        const resultAction = await dispatch(updateInspectionLevel({ id, data: apiData }));
        
        if (updateInspectionLevel.fulfilled.match(resultAction)) {
          toast.success('Inspection level updated successfully');
          navigate('/inspection');
        } else {
          // Handle rejection
          const error = resultAction.payload || resultAction.error;
          throw error;
        }
      } else {
        await inspectionService.createInspectionLevel(apiData);
        toast.success('Inspection level created successfully');
        navigate('/inspection');
      }
    } catch (error) {
      console.error('Error saving inspection level:', error);
      
      // More detailed error reporting
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Show specific error message from the API if available
        if (error.response.data && error.response.data.message) {
          toast.error(`Error: ${error.response.data.message}`);
        } else {
          toast.error(`Server error (${error.response.status})`);
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        toast.error('Network error: No response from server');
      } else {
        // Error setting up the request
        toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
      }
      
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Add new handlers for questionnaire functionality
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(), // Temporary ID for new questions
        text: '',
        answerType: 'yesno',
        options: [],
        required: true
      }
    ]);
  };
  
  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };
  
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    
    // If answer type is changed to something other than 'options', 
    // clear the options array unless it's a "select" or "multiple_choice" type
    if (field === 'answerType' && 
        value !== 'select' && 
        value !== 'multiple_choice' && 
        newQuestions[index].options?.length) {
      newQuestions[index].options = [];
    }
    
    // If changing to a type that needs options, initialize with empty array
    if (field === 'answerType' && 
        (value === 'select' || value === 'multiple_choice') && 
        !Array.isArray(newQuestions[index].options)) {
      newQuestions[index].options = [''];
    }
    
    setQuestions(newQuestions);
  };
  
  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    if (!Array.isArray(newQuestions[questionIndex].options)) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };
  
  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };
  
  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  // Save question to library
  const saveQuestionToLibrary = (question) => {
    // Only save if it has text
    if (!question.text.trim()) return;

    // Check if this question already exists in the library
    const existingQuestion = questionLibrary.find(q => q.text.trim() === question.text.trim());
    
    if (!existingQuestion) {
      dispatch(addQuestionToLibrary({
        text: question.text,
        answerType: question.answerType,
        options: question.options || [],
        required: question.required
      }))
        .unwrap()
        .then(() => {
          toast.success('Question saved to library');
        })
        .catch(error => {
          toast.error(`Failed to save question: ${error}`);
        });
    } else {
      toast.info('This question is already in your library');
    }
  };

  // Add question from library
  const addQuestionFromLibrary = (libraryQuestion) => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: libraryQuestion.text,
        answerType: libraryQuestion.answerType,
        options: [...(libraryQuestion.options || [])],
        required: libraryQuestion.required
      }
    ]);
    setShowQuestionLibrary(false);
  };

  // Filter questions based on search
  const filteredLibraryQuestions = searchQuery.trim() === '' 
    ? questionLibrary 
    : questionLibrary.filter(q => 
        q.text.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (initialLoading) {
    return <InspectionLevelSkeleton />;
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/inspection')} disabled={loading}>
        <ArrowLeft size={18} />
        Back to Inspection Levels
      </BackButton>

      <Header>
        <PageTitle>
          <Layers size={24} />
          {id ? 'Edit Inspection Level' : 'Create Inspection Level'}
        </PageTitle>
        <SubTitle>
          {id ? 'Modify existing inspection level details' : 'Add a new inspection level to the system'}
        </SubTitle>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>Basic Information</SectionTitle>
          <FormGrid>
            <FormGroup>
              <Label>Level Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter level name"
                disabled={loading}
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Type</Label>
              <Select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                disabled={loading}
              >
                <option value="safety">Safety</option>
                <option value="environmental">Environmental</option>
                <option value="operational">Operational</option>
                <option value="quality">Quality</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Status</Label>
              <Select 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Priority</Label>
              <Select 
                name="priority" 
                value={formData.priority} 
                onChange={handleChange}
                disabled={loading}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </FormGroup>

            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <Label>Description</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter level description"
                disabled={loading}
              />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
            </FormGroup>
          </FormGrid>
        </FormSection>

        <FormSection>
          <SectionTitle>
            Sub Levels
            <IconButton type="button" onClick={addSubLevel} disabled={loading}>
              <Plus size={16} />
            </IconButton>
          </SectionTitle>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="subLevels" type="subLevels">
              {(provided) => (
                <SubLevelsContainer
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {formData.subLevels.map((level, index) => (
                    <Draggable
                      key={level.id.toString()}
                      draggableId={level.id.toString()}
                      index={index}
                      isDragDisabled={loading}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <SubLevelRow
                            level={level}
                            onSubLevelChange={handleSubLevelChange}
                            onRemoveSubLevel={removeSubLevel}
                            onAddNestedSubLevel={addNestedSubLevel}
                            loading={loading}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </SubLevelsContainer>
              )}
            </Droppable>
          </DragDropContext>
          {errors.subLevels && <ErrorMessage>{errors.subLevels}</ErrorMessage>}
        </FormSection>

        <QuestionnaireSection>
          <SectionTitle>
            <List size={18} />
            Pre-Inspection Questionnaire
          </SectionTitle>
          
          <SubTitle>
            Add questions that inspectors must answer before starting the inspection
          </SubTitle>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <AddButton type="button" onClick={addQuestion} disabled={loading}>
              <PlusCircle size={18} /> Add Question
            </AddButton>
            
            <QuestionLibraryButton type="button" onClick={() => setShowQuestionLibrary(true)}>
              <BookOpen size={18} /> Question Library
            </QuestionLibraryButton>
          </div>
          
          {questions.map((question, index) => (
            <QuestionItem key={index}>
              <QuestionHeader>
                <QuestionTitle>Question {index + 1}</QuestionTitle>
                <QuestionActions>
                  <SaveToLibraryButton 
                    type="button" 
                    onClick={() => saveQuestionToLibrary(question)}
                    title="Save to Question Library"
                  >
                    <Save size={14} /> Save
                  </SaveToLibraryButton>
                  <IconButton onClick={() => removeQuestion(index)} title="Remove Question">
                    <X size={18} />
                  </IconButton>
                </QuestionActions>
              </QuestionHeader>
              
              <QuestionForm>
                <FormGroup>
                  <Label>Question Text <span style={{ color: 'red' }}>*</span></Label>
                  <Input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                    placeholder="Enter question text"
                    disabled={loading}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Answer Type</Label>
                  <Select
                    value={question.answerType}
                    onChange={(e) => updateQuestion(index, 'answerType', e.target.value)}
                    disabled={loading}
                  >
                    <option value="yesno">Yes/No</option>
                    <option value="text">Text Input</option>
                    <option value="number">Number Input</option>
                    <option value="select">Single Select</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="compliance">Compliance Status</option>
                  </Select>
                </FormGroup>
                
                {(question.answerType === 'select' || question.answerType === 'multiple_choice') && (
                  <OptionsContainer>
                    <Label>Options <span style={{ color: 'red' }}>*</span></Label>
                    
                    {Array.isArray(question.options) && question.options.map((option, optIndex) => (
                      <OptionItem key={optIndex}>
                        <Input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          disabled={loading}
                        />
                        <IconButton 
                          onClick={() => removeOption(index, optIndex)} 
                          title="Remove Option"
                          disabled={loading || question.options.length <= 1}
                        >
                          <X size={16} />
                        </IconButton>
                      </OptionItem>
                    ))}
                    
                    <Button 
                      type="button" 
                      onClick={() => addOption(index)}
                      disabled={loading}
                      style={{ marginTop: '8px' }}
                    >
                      <Plus size={16} /> Add Option
                    </Button>
                  </OptionsContainer>
                )}
                
                <FormGroup style={{ marginTop: '10px' }}>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                      disabled={loading}
                    />
                    Required question
                  </CheckboxLabel>
                </FormGroup>
              </QuestionForm>
            </QuestionItem>
          ))}
        </QuestionnaireSection>
        
        <ButtonGroup>
          <Button 
            type="button" 
            onClick={() => navigate('/inspection')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Save Changes' : 'Create Level')}
          </Button>
        </ButtonGroup>
      </Form>

      {/* Question Library Modal */}
      {showQuestionLibrary && (
        <QuestionLibraryModal>
          <QuestionLibraryContent>
            <QuestionLibraryHeader>
              <QuestionLibraryTitle>Question Library</QuestionLibraryTitle>
              <QuestionLibraryClose onClick={() => setShowQuestionLibrary(false)}>
                <X size={24} />
              </QuestionLibraryClose>
            </QuestionLibraryHeader>
            
            <SearchInput
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {libraryLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spinner size={24} />
                <p>Loading question library...</p>
              </div>
            ) : filteredLibraryQuestions.length > 0 ? (
              <QuestionLibraryList>
                {filteredLibraryQuestions.map((question) => (
                  <QuestionLibraryItem
                    key={question._id}
                    onClick={() => addQuestionFromLibrary(question)}
                  >
                    <QuestionLibraryItemContent>
                      {question.text}
                    </QuestionLibraryItemContent>
                    <QuestionLibraryItemFooter>
                      <span>Type: {question.answerType}</span>
                      <span>{question.required ? 'Required' : 'Optional'}</span>
                    </QuestionLibraryItemFooter>
                  </QuestionLibraryItem>
                ))}
              </QuestionLibraryList>
            ) : (
              <QuestionLibraryEmpty>
                {searchQuery.trim() !== '' 
                  ? 'No matching questions found' 
                  : 'No saved questions yet. Save questions to your library for reuse.'}
              </QuestionLibraryEmpty>
            )}
          </QuestionLibraryContent>
        </QuestionLibraryModal>
      )}
    </PageContainer>
  );
};

export default InspectionLevelForm;