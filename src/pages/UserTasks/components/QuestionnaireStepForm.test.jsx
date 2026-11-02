import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import en from '../../../locales/en.json';
import ar from '../../../locales/ar.json';
import QuestionnaireStepForm from './QuestionnaireStepForm';

const { dispatch, updateTaskQuestionnaire } = vi.hoisted(() => ({
  dispatch: vi.fn(() => ({ unwrap: () => Promise.resolve({ saved: true }) })),
  updateTaskQuestionnaire: vi.fn(payload => payload),
}));
vi.mock('react-redux', () => ({ useDispatch: () => dispatch }));
vi.mock('../../../context/LoadingContext', () => ({ useLoading: () => ({ startLoading: vi.fn(), stopLoading: vi.fn() }) }));
vi.mock('../../../store/slices/userTasksSlice', () => ({ updateTaskQuestionnaire }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it.each([
  ['en', 'Yes', 'Save Questionnaire', 'All required questions have been answered'],
  ['ar', 'نعم', 'حفظ الاستبيان', 'تمت الإجابة عن جميع الأسئلة المطلوبة'],
])('localizes questionnaire controls in %s while submitting the original response codes', async (lng, yes, save, validation) => {
  const i18n = createInstance();
  await i18n.init({ lng, fallbackLng: false, resources: { en: { translation: en }, ar: { translation: ar } } });
  render(<I18nextProvider i18n={i18n}><QuestionnaireStepForm task={{
    _id: 'local-task', questions: [{ _id: 'local-question', text: 'Synthetic question', required: true, answerType: 'yes_no' }],
  }} /></I18nextProvider>);
  fireEvent.click(screen.getByRole('button', { name: yes, exact: true }));
  expect(screen.getByText(validation)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: save }));
  await waitFor(() => expect(updateTaskQuestionnaire).toHaveBeenCalledWith({
    taskId: 'local-task', questionnaire: { responses: { 'q-local-question': 'yes' }, completed: true, notes: '' },
  }));
});
