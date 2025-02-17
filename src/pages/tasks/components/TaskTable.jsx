import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import TaskStatus from './TaskStatus';
import TaskPriority from './TaskPriority';
import TaskAssignee from './TaskAssignee';
import { PERMISSIONS } from '../../../utils/permissions';
import { deleteTaskAttachment } from '../../../store/slices/taskSlice';
import usePermissions from '../../../hooks/usePermissions';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    position: relative;
    transition: all 0.2s ease;
  }

  th {
    background: #f5f7fb;
    font-weight: 600;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background: #e8eaf6;
    }
  }

  td {
    font-size: 14px;
    color: #666;
  }

  tbody tr:hover {
    background: #f5f7fb;
  }
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
`;

const DialogTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 8px;
`;

const DialogMessage = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const DialogButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'danger' ? `
    background: #dc2626;
    color: white;
    border: none;

    &:hover {
      background: #b91c1c;
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #e0e0e0;

    &:hover {
      background: #f5f5f5;
    }
  `}
`;
const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
`;

const NoDataMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
`;

const ActionsMenu = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
`;

const PaginationInfo = styled.div`
  color: #666;
  font-size: 14px;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  background: white;
  border: 1px solid #e0e0e0;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
`;



const TaskTable = ({ tasks, loading, pagination, onPageChange, onSort }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.({ key, direction });
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
    setActiveDropdown(null);
  };

  const handleEditTask = (taskId) => {
    navigate(`/tasks/${taskId}/edit`);
    setActiveDropdown(null);
  };

  const handleDeleteClick = (task) => {
    setDeleteConfirm(task);
    setActiveDropdown(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteTaskAttachment(deleteConfirm._id)).unwrap();
      toast.success('Task deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <TableContainer>
        <LoadingOverlay>Loading tasks...</LoadingOverlay>
      </TableContainer>
    );
  }

  if (!tasks.length) {
    return (
      <TableContainer>
        <NoDataMessage>No tasks found matching your criteria.</NoDataMessage>
      </TableContainer>
    );
  }

  return (
    <>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th onClick={() => handleSort('title')}>Task Name</th>
              <th onClick={() => handleSort('inspectionLevel')}>Inspection Level</th>
              <th onClick={() => handleSort('assignedTo')}>Assignee</th>
              <th onClick={() => handleSort('priority')}>Priority</th>
              <th onClick={() => handleSort('status')}>Status</th>
              <th onClick={() => handleSort('deadline')}>Due Date</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id}>
                <td>{task.title}</td>
                <td>{task.inspectionLevel?.name}</td>
                <td>
                  <TaskAssignee 
                    assignees={task.assignedTo} 
                    maxDisplay={2}
                  />
                </td>
                <td><TaskPriority priority={task.priority} /></td>
                <td><TaskStatus status={task.status} /></td>
                <td>{new Date(task.deadline).toLocaleDateString()}</td>
                <td>{task.overallProgress}%</td>
                <td>
                  <ActionsMenu>
                    {hasPermission(PERMISSIONS.VIEW_TASKS) && (
                      <ActionButton onClick={() => handleViewTask(task._id)}>
                        <Eye size={16} />
                      </ActionButton>
                    )}
                    
                    {hasPermission(PERMISSIONS.EDIT_TASKS) && (
                      <ActionButton onClick={() => handleEditTask(task._id)}>
                        <Edit size={16} />
                      </ActionButton>
                    )}
                    
                    {hasPermission(PERMISSIONS.DELETE_TASKS) && (
                      <ActionButton onClick={() => handleDeleteClick(task)}>
                        <Trash size={16} />
                      </ActionButton>
                    )}
                  </ActionsMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <PaginationContainer>
          <PaginationInfo>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} tasks
          </PaginationInfo>
          
          <PaginationButtons>
            <PaginationButton 
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft size={16} />
            </PaginationButton>
            
            <PaginationButton
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
            >
              <ChevronRight size={16} />
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>
      </TableContainer>

      {deleteConfirm && (
        <DeleteConfirmDialog>
          <DialogContent>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogMessage>
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </DialogMessage>
            <DialogActions>
              <DialogButton onClick={() => setDeleteConfirm(null)}>
                Cancel
              </DialogButton>
              <DialogButton variant="danger" onClick={handleConfirmDelete}>
                Delete Task
              </DialogButton>
            </DialogActions>
          </DialogContent>
        </DeleteConfirmDialog>
      )}
    </>
  );
};

export default TaskTable;