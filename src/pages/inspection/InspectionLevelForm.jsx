import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Move, Layers } from 'lucide-react';
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
    subLevels: [{ id: Date.now(), name: '', description: '', order: 0 }]
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
      setFormData(data);
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

  const handleSubLevelChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      subLevels: prev.subLevels.map(level => 
        level.id === id ? { ...level, [field]: value } : level
      )
    }));
  };

  const addSubLevel = () => {
    setFormData(prev => ({
      ...prev,
      subLevels: [
        ...prev.subLevels,
        { 
          id: Date.now(), 
          name: '', 
          description: '', 
          order: prev.subLevels.length 
        }
      ]
    }));
  };

  const removeSubLevel = (id) => {
    setFormData(prev => ({
      ...prev,
      subLevels: prev.subLevels.filter(level => level.id !== id)
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.subLevels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({
      ...prev,
      subLevels: items.map((item, index) => ({ ...item, order: index }))
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.subLevels.some(level => !level.name)) {
      newErrors.subLevels = 'All sub-levels must have names';
    }
    if (formData.subLevels.some(level => !level.description)) {
      newErrors.subLevels = 'All sub-levels must have descriptions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    try {
      setLoading(true);
      if (id) {
        await inspectionService.updateInspectionLevel(id, formData);
        toast.success('Inspection level updated successfully');
      } else {
        await inspectionService.createInspectionLevel(formData);
        toast.success('Inspection level created successfully');
      }
      navigate('/inspection');
    } catch (error) {
      handleError(error);
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

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="subLevels">
              {(provided) => (
                <SubLevelsContainer
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {formData.subLevels.map((level, index) => (
                    <Draggable
                      key={level.id}
                      draggableId={level?.id?.toString()}
                      index={index}
                      isDragDisabled={loading}
                    >
                      {(provided, snapshot) => (
                        <SubLevelItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          isDragging={snapshot.isDragging}
                        >
                          <DragHandle {...provided.dragHandleProps}>
                            <Move size={16} />
                          </DragHandle>
                          <SubLevelInput
                            type="text"
                            value={level.name}
                            onChange={(e) => handleSubLevelChange(level.id, 'name', e.target.value)}
                            placeholder="Enter sub-level name"
                            disabled={loading}
                          />
                          <SubLevelInput
                            type="text"
                            value={level.description}
                            onChange={(e) => handleSubLevelChange(level.id, 'description', e.target.value)}
                            placeholder="Enter sub-level description"
                            disabled={loading}
                          />
                          <IconButton
                            type="button"
                            onClick={() => removeSubLevel(level.id)}
                            disabled={formData.subLevels.length === 1 || loading}
                          >
                            <Minus size={16} />
                          </IconButton>
                        </SubLevelItem>
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