import { useEffect, useRef } from 'react';

/**
 * Field-setter bridge for agent "computer-use" operation of the portal.
 *
 * React-controlled widgets (DatePickers, custom selects, toggles) can't be driven reliably by
 * writing DOM `.value`. Forms register imperative setters/getters here via `useAgentField`, and
 * `actionBridge` prefers a registered setter, falling back to the DOM for plain inputs/native
 * selects. This scales: a new field becomes agent-operable just by adding the hook — no per-action
 * code in the bridge.
 */

const fieldRegistry = new Map(); // fieldId -> { setValue, getValue, getOptions }

export const registerAgentField = (fieldId, handlers) => {
  if (!fieldId || !handlers) return () => {};
  fieldRegistry.set(fieldId, handlers);
  return () => { if (fieldRegistry.get(fieldId) === handlers) fieldRegistry.delete(fieldId); };
};

export const getAgentField = (fieldId) => fieldRegistry.get(fieldId);

export const setAgentFieldValue = async (fieldId, value) => {
  const handlers = fieldRegistry.get(fieldId);
  if (!handlers || typeof handlers.setValue !== 'function') return false;
  try {
    await handlers.setValue(value);
    return true;
  } catch (_error) {
    return false;
  }
};

export const getAgentFieldOptions = (fieldId) => {
  const handlers = fieldRegistry.get(fieldId);
  return handlers && typeof handlers.getOptions === 'function' ? handlers.getOptions() : null;
};

/**
 * Register a field's imperative handlers for the lifetime of the component.
 * @param {string} fieldId e.g. "tasks.form.dueDate"
 * @param {{ setValue?: Function, getValue?: Function, getOptions?: Function }} handlers
 */
export const useAgentField = (fieldId, handlers) => {
  const ref = useRef(handlers);
  ref.current = handlers;
  useEffect(() => {
    if (!fieldId) return undefined;
    return registerAgentField(fieldId, {
      setValue: (value) => ref.current?.setValue?.(value),
      getValue: () => ref.current?.getValue?.(),
      getOptions: () => ref.current?.getOptions?.(),
    });
  }, [fieldId]);
};
