import { toast } from 'react-hot-toast';
import { AGENT_ACTION_TYPES, actionBelongsToRegistry, fieldBelongsToRegistry } from './agentRegistry';

const STEP_DELAY_MS = 360;
const WAIT_ATTEMPTS = 30;

const safePath = (path) => (
  typeof path === 'string' &&
  /^\/(?!\/)[A-Za-z0-9/_-]*(?:\?[A-Za-z0-9_=&%.-]*)?$/.test(path)
);

const escapeCss = (value) => (
  window.CSS?.escape ? window.CSS.escape(value) : String(value).replace(/["\\]/g, '\\$&')
);

const findField = (fieldId) => {
  if (!fieldBelongsToRegistry(fieldId)) return null;
  const escaped = escapeCss(fieldId);
  return document.querySelector(`[data-agent-field="${escaped}"]`);
};

const findAction = (actionId) => {
  if (!actionBelongsToRegistry(actionId)) return null;
  const escaped = escapeCss(actionId);
  return document.querySelector(`[data-agent-action="${escaped}"]`);
};

export const captureAgentFormSession = () => {
  const form = document.querySelector('[data-agent-form]');
  const currentFormKey = form?.dataset?.agentForm;
  if (!currentFormKey) return { currentFormKey: undefined, currentFormValues: {}, visibleFields: [], visibleFieldMetadata: [] };
  const fields = Array.from(document.querySelectorAll(`[data-agent-field^="${escapeCss(currentFormKey)}."]`));
  const currentFormValues = {};
  const visibleFields = [];
  const visibleFieldMetadata = [];
  fields.forEach(field => {
    const fieldId = field.dataset.agentField;
    const name = fieldId?.slice(`${currentFormKey}.`.length);
    if (!name) return;
    const label = labelForField(field);
    const value = field.type === 'checkbox' ? Boolean(field.checked) : field.value ?? '';
    visibleFields.push(name);
    currentFormValues[name] = value;
    visibleFieldMetadata.push({
      fieldId,
      name,
      label,
      type: field.tagName === 'SELECT' ? 'select' : field.type || field.tagName.toLowerCase(),
      value,
      required: Boolean(field.required || field.getAttribute('aria-required') === 'true'),
      disabled: Boolean(field.disabled),
      placeholder: field.getAttribute('placeholder') || '',
      options: field.tagName === 'SELECT'
        ? Array.from(field.options).map(option => ({
          value: option.value,
          label: option.textContent?.trim() || option.value,
          disabled: Boolean(option.disabled),
          selected: Boolean(option.selected),
        }))
        : undefined,
    });
  });
  return { currentFormKey, currentFormValues, visibleFields, visibleFieldMetadata };
};

const normalizeChoice = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const labelForField = (field) => {
  if (!field) return '';
  const id = field.getAttribute('id');
  if (id) {
    const explicit = document.querySelector(`label[for="${escapeCss(id)}"]`);
    if (explicit?.textContent?.trim()) return explicit.textContent.trim().replace(/\s*\*$/, '');
  }
  const wrapper = field.closest('label, div, section, form');
  const label = wrapper?.querySelector?.('label');
  return label?.textContent?.trim()?.replace(/\s*\*$/, '') || field.getAttribute('name') || field.dataset.agentField || '';
};

export const resolveSelectableValue = (select, requestedValue) => {
  if (!select || select.tagName !== 'SELECT') return requestedValue;
  const raw = String(requestedValue ?? '').trim();
  if (!raw) return raw;
  const options = Array.from(select.options).filter(option => !option.disabled);
  const exactValue = options.find(option => option.value === raw);
  if (exactValue) return exactValue.value;
  const exactLabel = options.find(option => (option.textContent || '').trim() === raw);
  if (exactLabel) return exactLabel.value;
  const normalized = normalizeChoice(raw);
  const normalizedMatches = options.filter(option => (
    normalizeChoice(option.value) === normalized ||
    normalizeChoice(option.textContent || '') === normalized
  ));
  if (normalizedMatches.length === 1) return normalizedMatches[0].value;
  const partialMatches = options.filter(option => {
    const value = normalizeChoice(option.value);
    const label = normalizeChoice(option.textContent || '');
    return normalized && (label.includes(normalized) || normalized.includes(label) || value.includes(normalized) || normalized.includes(value));
  });
  return partialMatches.length === 1 ? partialMatches[0].value : undefined;
};

const fieldNameAliases = {
  phone: ['phone', 'phone number', 'mobile', 'mobile number', 'contact', 'contact number'],
  emergencyContact: ['emergency contact', 'emergency number', 'emergency phone', 'emergency'],
  address: ['address'],
  email: ['email', 'email address'],
  name: ['name', 'full name'],
  department: ['department', 'dept'],
  role: ['role'],
  status: ['status'],
  title: ['title'],
  description: ['description', 'details'],
  location: ['location'],
};

const fieldNameFromReference = (text, values = {}, formKey) => {
  const normalized = normalizeChoice(text);
  const knownNames = new Set([...Object.keys(fieldNameAliases), ...Object.keys(values || {})]);
  if (formKey) {
    document.querySelectorAll(`[data-agent-field^="${escapeCss(formKey)}."]`).forEach(field => {
      const name = field.dataset.agentField?.slice(`${formKey}.`.length);
      if (name) knownNames.add(name);
    });
  }
  for (const name of knownNames) {
    const aliases = [...(fieldNameAliases[name] || []), name, labelForField(findField(`${formKey}.${name}`))].filter(Boolean);
    if (aliases.some(alias => {
      const item = normalizeChoice(alias);
      return item && (normalized === item || normalized.includes(item));
    })) return name;
  }
  return undefined;
};

const resolveFieldReferenceValue = (value, values = {}, formKey) => {
  const text = String(value || '').trim();
  if (!text || !/\b(same\s+as|as\s+same\s+as|copy|use|from)\b/i.test(text)) return value;
  const match = text.match(/\b(?:same\s+as|as\s+same\s+as|copy|use\s+(?:existing|current)?|use|from)\s+(?:the\s+)?(.+?)\s*(?:field|number|value)?$/i);
  const name = fieldNameFromReference(match?.[1] || text, values, formKey);
  if (!name) return value;
  if (values[name]) return values[name];
  const field = findField(`${formKey}.${name}`);
  return field?.type === 'checkbox' ? Boolean(field.checked) : field?.value || value;
};

const sleep = (ms = STEP_DELAY_MS) => new Promise(resolve => window.setTimeout(resolve, ms));

const waitFor = async (resolver, attempts = WAIT_ATTEMPTS, delayMs = 120) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = resolver();
    if (value) return value;
    await sleep(delayMs);
  }
  return null;
};

const moveToElement = (element, label, onCursor) => {
  if (!element || !onCursor) return;
  const rect = element.getBoundingClientRect();
  onCursor({
    visible: true,
    label,
    x: Math.max(16, rect.left + Math.min(rect.width / 2, 80)),
    y: Math.max(16, rect.top + Math.min(rect.height / 2, 22)),
  });
};

const setNativeValue = (element, value) => {
  if (!element || element.disabled) return false;
  if ((value === undefined || value === null || value === '') && element.value && !element.dataset.agentAllowClear) return false;
  const stringValue = element.tagName === 'SELECT'
    ? resolveSelectableValue(element, value)
    : value === undefined || value === null ? '' : String(value);
  if (element.tagName === 'SELECT' && stringValue === undefined) return false;
  if (element.type === 'checkbox') {
    element.checked = value === undefined ? true : Boolean(value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  const prototype = element.tagName === 'SELECT'
    ? window.HTMLSelectElement.prototype
    : element.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor?.set) descriptor.set.call(element, stringValue);
  else element.value = stringValue;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
};

const focusElement = (element) => {
  if (!element) return;
  element.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  element.focus?.({ preventScroll: true });
};

const markHighlighted = (element, duration = 2400) => {
  if (!element) return;
  const previousBoxShadow = element.style.boxShadow;
  const previousOutline = element.style.outline;
  element.dataset.agentHighlighted = 'true';
  element.style.outline = '2px solid var(--color-teal)';
  element.style.boxShadow = '0 0 0 4px rgba(44, 151, 153, 0.18)';
  window.setTimeout(() => {
    delete element.dataset.agentHighlighted;
    element.style.outline = previousOutline;
    element.style.boxShadow = previousBoxShadow;
  }, duration);
};

const stepLabel = (action) => action?.label || action?.type?.replaceAll('_', ' ') || 'Agent action';

const emitStep = (onStep, label, status = 'running') => {
  if (!onStep) return;
  onStep({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, label, status });
};

const runSingleAction = async (action, navigate, handlers = {}) => {
  const payload = action?.payload || {};
  const label = stepLabel(action);
  emitStep(handlers.onStep, label, 'running');

  if (!AGENT_ACTION_TYPES.has(action?.type)) {
    handlers.onUnsupported?.(action);
    emitStep(handlers.onStep, `Unsupported action: ${label}`, 'failed');
    return false;
  }

  switch (action.type) {
    case 'navigate':
      if (!safePath(payload.path)) return false;
      handlers.onCursor?.({ visible: true, label, x: 44, y: 44 });
      navigate(payload.path);
      await sleep(payload.delayMs || 300);
      emitStep(handlers.onStep, label, 'completed');
      return true;

    case 'open_record': {
      const paths = {
        tasks: '/tasks',
        user_tasks: '/user-tasks',
        users: '/users',
        assets: '/assets',
        inspection_templates: '/inspection',
        questionnaires: '/questionnaire/edit',
        profile: '/profile',
      };
      if (payload.recordType === 'profile') {
        navigate('/profile');
        emitStep(handlers.onStep, label, 'completed');
        return true;
      }
      const base = paths[payload.recordType];
      if (!base || !/^[a-fA-F0-9]{24}$/.test(payload.id || '')) return false;
      navigate(`${base}/${payload.id}`);
      emitStep(handlers.onStep, label, 'completed');
      return true;
    }

    case 'refresh_current_page':
      toast.success(payload.message || 'Refreshing page');
      window.setTimeout(() => window.location.reload(), payload.delayMs || 350);
      emitStep(handlers.onStep, label, 'completed');
      return true;

    case 'show_toast':
      toast.success(payload.message || label || 'Done');
      emitStep(handlers.onStep, label, 'completed');
      return true;

    case 'focus_field':
    case 'highlight_field':
    case 'highlight_element':
    case 'scroll_to_field':
    case 'scroll_to_element': {
      const field = await waitFor(() => findField(payload.fieldId || payload.name), 20, 120);
      if (!field) return false;
      moveToElement(field, label, handlers.onCursor);
      focusElement(field);
      markHighlighted(field);
      emitStep(handlers.onStep, label, 'completed');
      return true;
    }

    case 'type_text':
    case 'select_option':
    case 'apply_filter': {
      const field = await waitFor(() => findField(payload.fieldId || payload.name), 24, 120);
      if (!field) return false;
      moveToElement(field, label, handlers.onCursor);
      focusElement(field);
      if (payload.value !== undefined) setNativeValue(field, payload.value);
      markHighlighted(field, 2000);
      emitStep(handlers.onStep, label, 'completed');
      return true;
    }

    case 'fill_form': {
      const formKey = payload.formKey;
      if (!formKey || typeof formKey !== 'string') return false;
      const values = { ...(payload.values || {}) };
      let applied = 0;
      for (const [name, value] of Object.entries(values)) {
        if ((value === undefined || value === null || value === '') && !(payload.clearFields || []).includes(name)) continue;
        const resolvedValue = resolveFieldReferenceValue(value, values, formKey);
        values[name] = resolvedValue;
        const fieldId = `${formKey}.${name}`;
        const field = await waitFor(() => findField(fieldId), 14, 90);
        if (!field) continue;
        moveToElement(field, `Filling ${name}`, handlers.onCursor);
        focusElement(field);
        if (setNativeValue(field, resolvedValue)) applied += 1;
        markHighlighted(field, 2500);
        await sleep(payload.fieldDelayMs || 420);
      }
      const focusName = payload.focusField || Object.keys(values)[0];
      const focusField = focusName ? findField(`${formKey}.${focusName}`) : null;
      if (focusField) {
        moveToElement(focusField, payload.focusField ? `Review ${payload.focusField}` : 'Review form', handlers.onCursor);
        focusElement(focusField);
      }
      emitStep(handlers.onStep, applied ? label : `${label} (no matching fields)`, applied ? 'completed' : 'failed');
      return applied > 0;
    }

    case 'click_element':
    case 'open_modal': {
      const button = await waitFor(() => findAction(payload.actionId || payload.name), 24, 120);
      if (!button) return false;
      moveToElement(button, label, handlers.onCursor);
      focusElement(button);
      button.click();
      await sleep(payload.delayMs || 250);
      emitStep(handlers.onStep, label, 'completed');
      return true;
    }

    case 'submit_visible_form_after_approval': {
      const button = await waitFor(() => findAction(payload.submitActionId || payload.actionId || payload.name), 24, 120);
      if (!button) return false;
      moveToElement(button, label || 'Submitting form', handlers.onCursor);
      focusElement(button);
      markHighlighted(button, 1200);
      button.click();
      if (payload.successToast) toast.success(payload.successToast);
      emitStep(handlers.onStep, label, 'completed');
      return true;
    }

    case 'perform_ui_action_after_approval': {
      const actions = Array.isArray(payload.actions) ? payload.actions : [];
      if (!actions.length) return false;
      let completed = 0;
      for (const nestedAction of actions) {
        if (nestedAction?.type === 'perform_ui_action_after_approval') continue;
        // Reuse the normal runner path so every click/field still passes registry checks.
        // eslint-disable-next-line no-await-in-loop
        if (await runSingleAction(nestedAction, navigate, handlers)) completed += 1;
      }
      if (payload.successToast) toast.success(payload.successToast);
      emitStep(handlers.onStep, label, completed === actions.length ? 'completed' : 'failed');
      return completed === actions.length;
    }

    case 'wait_for_page': {
      const pageKey = payload.pageKey || payload.key;
      const page = pageKey ? await waitFor(() => document.querySelector(`[data-agent-page="${escapeCss(pageKey)}"]`), 30, 150) : true;
      emitStep(handlers.onStep, label, page ? 'completed' : 'failed');
      return Boolean(page);
    }

    case 'update_form_draft_state':
      handlers.onUnsupported?.(action);
      emitStep(handlers.onStep, label, 'completed');
      return false;

    default:
      handlers.onUnsupported?.(action);
      emitStep(handlers.onStep, `Unsupported action: ${label}`, 'failed');
      return false;
  }
};

export const runAgentActions = async (actions = [], navigate, handlers = {}) => {
  const results = [];
  for (const action of actions) {
    try {
      results.push(await runSingleAction(action, navigate, handlers));
    } catch (_error) {
      emitStep(handlers.onStep, `Failed: ${stepLabel(action)}`, 'failed');
      results.push(false);
    }
  }
  window.setTimeout(() => handlers.onCursor?.(current => ({ ...(typeof current === 'object' ? current : {}), visible: false })), 900);
  return results;
};

const isSafeAgentAction = (action) => {
  if (!AGENT_ACTION_TYPES.has(action?.type) || action.type === 'update_form_draft_state') return false;
  if (action?.type === 'navigate') return safePath(action?.payload?.path);
  if (['focus_field', 'highlight_field', 'highlight_element', 'scroll_to_field', 'scroll_to_element', 'type_text', 'select_option', 'apply_filter'].includes(action?.type)) {
    return fieldBelongsToRegistry(action?.payload?.fieldId || action?.payload?.name);
  }
  if (['click_element', 'open_modal'].includes(action?.type)) {
    return actionBelongsToRegistry(action?.payload?.actionId || action?.payload?.name);
  }
  if (action?.type === 'submit_visible_form_after_approval') {
    return actionBelongsToRegistry(action?.payload?.submitActionId || action?.payload?.actionId || action?.payload?.name);
  }
  if (action?.type === 'perform_ui_action_after_approval') {
    const nestedActions = Array.isArray(action?.payload?.actions) ? action.payload.actions : [];
    return nestedActions.length > 0 && nestedActions.every(nestedAction => isSafeAgentAction(nestedAction));
  }
  return true;
};

export const dispatchAgentAction = (action, navigate) => {
  if (!isSafeAgentAction(action)) return false;
  runAgentActions([action], navigate);
  return true;
};
