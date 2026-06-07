import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { captureAgentFormSession, dispatchAgentAction, resolveSelectableValue, runAgentActions } from './actionBridge';

describe('dispatchAgentAction', () => {
  it('navigates only to safe internal paths', () => {
    const navigate = vi.fn();
    expect(dispatchAgentAction({ type: 'navigate', payload: { path: '/tasks' } }, navigate)).toBe(true);
    expect(dispatchAgentAction({ type: 'navigate', payload: { path: '//evil.example' } }, navigate)).toBe(false);
    expect(navigate).toHaveBeenCalledOnce();
  });

  it('surfaces page-specific draft actions instead of mutating unknown page state', () => {
    expect(dispatchAgentAction({ type: 'update_form_draft_state', payload: { values: { q1: 'yes' } } }, vi.fn())).toBe(false);
  });

  it('scrolls and focuses a matching field safely', () => {
    const field = document.createElement('input');
    field.dataset.agentField = 'users.search';
    field.scrollIntoView = vi.fn();
    field.focus = vi.fn();
    document.body.appendChild(field);
    expect(dispatchAgentAction({ type: 'highlight_field', payload: { fieldId: 'users.search' } }, vi.fn())).toBe(true);
    return waitFor(() => expect(field.focus).toHaveBeenCalled()).finally(() => field.remove());
  });

  it('fills only registry-backed form fields', async () => {
    const name = document.createElement('input');
    name.dataset.agentField = 'users.form.name';
    document.body.appendChild(name);
    const unsafe = document.createElement('input');
    unsafe.dataset.agentField = 'unsafe.form.name';
    document.body.appendChild(unsafe);
    await runAgentActions([{ type: 'fill_form', payload: { formKey: 'users.form', values: { name: 'Yash' } } }], vi.fn());
    expect(name.value).toBe('Yash');
    expect(unsafe.value).toBe('');
    name.remove();
    unsafe.remove();
  });

  it('preserves existing form values during partial fills and captures visible form state', async () => {
    const form = document.createElement('form');
    form.dataset.agentForm = 'users.form';
    const name = document.createElement('input');
    name.dataset.agentField = 'users.form.name';
    name.value = 'Existing Name';
    const role = document.createElement('select');
    role.dataset.agentField = 'users.form.role';
    role.innerHTML = '<option value="inspector">Inspector</option><option value="supervisor">Supervisor</option>';
    role.value = 'inspector';
    form.appendChild(name);
    form.appendChild(role);
    document.body.appendChild(form);
    await runAgentActions([{ type: 'fill_form', payload: { formKey: 'users.form', values: { role: 'supervisor' } } }], vi.fn());
    expect(name.value).toBe('Existing Name');
    expect(role.value).toBe('supervisor');
    expect(captureAgentFormSession()).toEqual(expect.objectContaining({
      currentFormKey: 'users.form',
      currentFormValues: expect.objectContaining({ name: 'Existing Name', role: 'supervisor' }),
      visibleFieldMetadata: expect.arrayContaining([
        expect.objectContaining({
          name: 'role',
          type: 'select',
          options: expect.arrayContaining([
            expect.objectContaining({ value: 'supervisor', label: 'Supervisor' }),
          ]),
        }),
      ]),
    }));
    form.remove();
  });

  it('selects dropdown options by visible label and normalized label', async () => {
    const department = document.createElement('select');
    department.dataset.agentField = 'users.form.department';
    department.innerHTML = '<option value="">Select Department</option><option value="Administration">Administration</option>';
    document.body.appendChild(department);
    expect(resolveSelectableValue(department, 'administration')).toBe('Administration');
    await runAgentActions([{ type: 'fill_form', payload: { formKey: 'users.form', values: { department: 'administration' } } }], vi.fn());
    expect(department.value).toBe('Administration');
    department.remove();
  });

  it('resolves same-as references from values filled in the same form action', async () => {
    const phone = document.createElement('input');
    phone.dataset.agentField = 'users.form.phone';
    const emergencyContact = document.createElement('input');
    emergencyContact.dataset.agentField = 'users.form.emergencyContact';
    document.body.appendChild(phone);
    document.body.appendChild(emergencyContact);
    await runAgentActions([{
      type: 'fill_form',
      payload: {
        formKey: 'users.form',
        values: {
          phone: '98281431670',
          emergencyContact: 'same as phone number',
        },
      },
    }], vi.fn());
    expect(phone.value).toBe('98281431670');
    expect(emergencyContact.value).toBe('98281431670');
    phone.remove();
    emergencyContact.remove();
  });

  it('does not fill disabled visible fields', async () => {
    const department = document.createElement('select');
    department.dataset.agentField = 'users.form.department';
    department.disabled = true;
    department.innerHTML = '<option value="">Select Department</option><option value="Administration">Administration</option>';
    document.body.appendChild(department);
    await runAgentActions([{ type: 'fill_form', payload: { formKey: 'users.form', values: { department: 'Administration' } } }], vi.fn());
    expect(department.value).toBe('');
    department.remove();
  });

  it('does not invent passwords when blank passwords are present', async () => {
    const password = document.createElement('input');
    password.type = 'password';
    password.dataset.agentField = 'users.form.password';
    const confirmPassword = document.createElement('input');
    confirmPassword.type = 'password';
    confirmPassword.dataset.agentField = 'users.form.confirmPassword';
    document.body.appendChild(password);
    document.body.appendChild(confirmPassword);
    await runAgentActions([{
      type: 'fill_form',
      payload: {
        formKey: 'users.form',
        generateTempPassword: true,
        values: { password: '', confirmPassword: '' },
      },
    }], vi.fn());
    expect(password.value).toBe('');
    expect(confirmPassword.value).toBe('');
    password.remove();
    confirmPassword.remove();
  });

  it('clicks only registry-backed submit buttons after approval', async () => {
    const submit = document.createElement('button');
    submit.dataset.agentAction = 'users.submit';
    submit.click = vi.fn();
    document.body.appendChild(submit);
    await runAgentActions([{ type: 'submit_visible_form_after_approval', payload: { submitActionId: 'users.submit' } }], vi.fn());
    expect(submit.click).toHaveBeenCalledOnce();
    submit.remove();
  });

  it('runs approved UI action sequences only against registered action IDs', async () => {
    const open = document.createElement('button');
    open.dataset.agentAction = 'users.export.open';
    open.click = vi.fn();
    const pdf = document.createElement('button');
    pdf.dataset.agentAction = 'users.export.pdf';
    pdf.click = vi.fn();
    const confirm = document.createElement('button');
    confirm.dataset.agentAction = 'document_export.confirm';
    confirm.click = vi.fn();
    document.body.append(open, pdf, confirm);

    await runAgentActions([{
      type: 'perform_ui_action_after_approval',
      payload: {
        actions: [
          { type: 'click_element', payload: { actionId: 'users.export.open' } },
          { type: 'click_element', payload: { actionId: 'users.export.pdf' } },
          { type: 'click_element', payload: { actionId: 'document_export.confirm' } },
        ],
      },
    }], vi.fn());

    expect(open.click).toHaveBeenCalledOnce();
    expect(pdf.click).toHaveBeenCalledOnce();
    expect(confirm.click).toHaveBeenCalledOnce();
    open.remove();
    pdf.remove();
    confirm.remove();
  });

  it('blocks unregistered UI action sequences', () => {
    const navigate = vi.fn();
    expect(dispatchAgentAction({
      type: 'perform_ui_action_after_approval',
      payload: {
        actions: [
          { type: 'click_element', payload: { actionId: 'users.export.open' } },
          { type: 'click_element', payload: { actionId: 'unsafe.export.everything' } },
        ],
      },
    }, navigate)).toBe(false);
  });
});
