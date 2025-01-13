import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash } from 'lucide-react';
import TaskStatus from './TaskStatus';
import TaskPriority from './TaskPriority';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f5f7fb;
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  td {
    font-size: 14px;
    color: #666;
  }

  tbody tr:hover {
    background: #f5f7fb;
  }
`;

const ActionsMenu = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fb;
    color: #1a237e;
  }
`;

const TaskTable = ({ tasks, filters, searchTerm }) => {
  const navigate = useNavigate();

  const filteredTasks = tasks.filter(task => {
    // Apply filters
    const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);
    const matchesPriority = filters.priority.length === 0 || filters.priority.includes(task.priority);
    const matchesType = filters.type.length === 0 || filters.type.includes(task.type);
    const matchesAssignee = filters.assignee.length === 0 || filters.assignee.includes(task.assignee);

    // Apply search
    const matchesSearch = 
      searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesType && matchesAssignee && matchesSearch;
  });

  const handleDeleteTask = (taskId) => {
    // Add confirmation dialog and deletion logic here
    console.log('Delete task:', taskId);
  };

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Type</th>
            <th>Assignee</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.type}</td>
              <td>{task.assignee}</td>
              <td><TaskPriority priority={task.priority} /></td>
              <td><TaskStatus status={task.status} /></td>
              <td>{task.dueDate}</td>
              <td>
                <ActionsMenu>
                  <ActionButton onClick={() => navigate(`/tasks/${task.id}`)}>
                    <Eye size={16} />
                  </ActionButton>
                  <ActionButton onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton onClick={() => handleDeleteTask(task.id)}>
                    <Trash size={16} />
                  </ActionButton>
                </ActionsMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default TaskTable;