import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import TaskDetailsView from './TaskDetailsView';

const dispatch = vi.hoisted(() => vi.fn());
vi.mock('react-redux', () => ({
  useDispatch: () => dispatch,
  useSelector: selector => selector({userTasks:{currentTask:null,taskDetailsLoading:false,detailsError:'You are not assigned to this task',error:null}}),
}));
vi.mock('../../hooks/useAuth', () => ({useAuth: () => ({user:{role:'superadmin'}})}));
vi.mock('../../hooks/usePermissions', () => ({usePermissions: () => ({userRole:'superadmin'})}));
vi.mock('react-i18next', () => ({useTranslation: () => ({t: key => key})}));
vi.mock('../../store/slices/userTasksSlice', () => ({fetchUserTaskDetails: id => ({type:'test/fetch',payload:id}),exportTaskReport:vi.fn(),updateTaskQuestionnaire:vi.fn()}));

it('shows the task-specific failure and permits retry instead of spinning forever', () => {
  render(<MemoryRouter initialEntries={['/tasks/task-1']}><Routes><Route path="/tasks/:taskId" element={<TaskDetailsView />} /></Routes></MemoryRouter>);
  expect(screen.getByText('You are not assigned to this task')).toBeInTheDocument();
  expect(screen.queryByText('tasks.loadingTaskDetails')).not.toBeInTheDocument();
  dispatch.mockClear();
  fireEvent.click(screen.getByRole('button',{name:'Try Again'}));
  expect(dispatch).toHaveBeenCalledWith({type:'test/fetch',payload:'task-1'});
});
