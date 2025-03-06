import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Move, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';

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
  const [expanded, setExpanded] = useState(false);
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

const InspectionLevelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loading, setLoading, handleError, inspectionService } = useOutletContext();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'safety',
    status: 'active',
    priority: 'medium',
    subLevels: [{ id: Date.now(), name: '', description: '', order: 0, subLevels: [] }]
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchInspectionLevel();
    }
  }, [id]);

  const fetchInspectionLevel = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
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

  // Helper to traverse the nested structure
  const getNestedValue = (obj, path) => {
    if (!path) return obj;
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (!current || current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  };

  // Helper to set nested values
  const setNestedValue = (obj, path, key, value) => {
    if (!path) {
      obj[key] = value;
      return obj;
    }
    
    const parts = path.split('.');
    let current = obj;
    let parent = null;
    let lastKey = null;
    
    // Navigate to the parent object
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      parent = current;
      lastKey = part;
      current = current[part];
      
      // If we encounter a non-existent path
      if (current === undefined) {
        return obj;
      }
    }
    
    // Update the value
    if (parent && lastKey) {
      parent[lastKey][key] = value;
    }
    
    return obj;
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
    // Handle moves between different lists (more complex, not implemented yet)
    else {
      console.log("Moving between different levels not implemented");
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        // If needed, transform the nested sublevel structure for the API
      };
      
      if (id) {
        await inspectionService.updateInspectionLevel(id, apiData);
        toast.success('Inspection level updated successfully');
      } else {
        await inspectionService.createInspectionLevel(apiData);
        toast.success('Inspection level created successfully');
      }
      
      navigate('/inspection');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

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
    </PageContainer>
  );
};

export default InspectionLevelForm;