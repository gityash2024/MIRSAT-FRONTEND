export const AGENT_ACTION_TYPES = new Set([
  'navigate',
  'open_record',
  'refresh_current_page',
  'focus_field',
  'click_element',
  'type_text',
  'select_option',
  'select_option_by_id',
  'set_date',
  'set_toggle',
  'apply_filter',
  'fill_form',
  'highlight_element',
  'highlight_field',
  'scroll_to_element',
  'scroll_to_field',
  'open_modal',
  'wait_for_page',
  'show_toast',
  'update_form_draft_state',
  'submit_visible_form_after_approval',
  'perform_ui_action_after_approval',
]);

const documentExportActions = [
  'document_export.cancel',
  'document_export.confirm',
];

const utilityFieldPrefixes = [
  'document_export.',
];

export const agentPages = {
  users: {
    label: 'Users',
    route: '/users',
    searchField: 'users.search',
    createRoute: '/users/create',
    createAction: 'users.create',
    formKey: 'users.form',
    requiredFields: ['name', 'email', 'phone', 'role', 'password', 'confirmPassword'],
    submitAction: 'users.submit',
    exportActions: {
      open: 'users.export.open',
      pdf: 'users.export.pdf',
    },
  },
  tasks: {
    label: 'Tasks',
    route: '/tasks',
    searchField: 'tasks.search',
    createRoute: '/tasks/create',
    createAction: 'tasks.create',
    formKey: 'tasks.form',
    requiredFields: ['title', 'description', 'priority', 'dueDate', 'assignedUser', 'inspectionLevel', 'asset'],
    filters: {
      status: 'tasks.filter.status',
      priority: 'tasks.filter.priority',
      assignedTo: 'tasks.filter.assignedTo',
      asset: 'tasks.filter.asset',
      assetType: 'tasks.filter.assetType',
      template: 'tasks.filter.inspectionLevel',
    },
    submitAction: 'tasks.submit',
    exportActions: {
      open: 'tasks.export.open',
      pdf: 'tasks.export.pdf',
      csv: 'tasks.export.csv',
      excel: 'tasks.export.excel',
      docx: 'tasks.export.docx',
    },
  },
  assets: {
    label: 'Assets',
    route: '/assets',
    searchField: 'assets.search',
    createAction: 'assets.create',
    formKey: 'assets.form',
    requiredFields: ['uniqueId', 'type', 'displayName', 'city', 'location'],
    filters: {
      type: 'assets.filter.type',
      city: 'assets.filter.city',
      sort: 'assets.filter.sort',
    },
    submitAction: 'assets.submit',
    exportActions: {
      open: 'assets.export.open',
    },
  },
  inspection_templates: {
    label: 'Templates',
    route: '/inspection',
    searchField: 'inspection_templates.search',
    createRoute: '/inspection/create/build',
    createAction: 'inspection_templates.create',
    filterAction: 'inspection_templates.filter',
    formKey: 'inspection_templates.form',
    requiredFields: ['name', 'type'],
    exportActions: {
      sampleJson: 'inspection_templates.download.sample_json',
      sampleExcel: 'inspection_templates.download.sample_excel',
    },
  },
  questionnaires: {
    label: 'Questionnaires',
    route: '/questionnaire',
    searchField: 'questionnaires.search',
    createRoute: '/questionnaire/create',
    createAction: 'questionnaires.create',
    formKey: 'questionnaires.form',
    requiredFields: ['text', 'answerType'],
  },
  logs: {
    label: 'Logs',
    route: '/logs',
    searchField: 'logs.search',
    filterAction: 'logs.filter',
  },
  profile: {
    label: 'Profile',
    route: '/profile',
    formKey: 'profile.form',
    requiredFields: ['name'],
    submitAction: 'profile.submit',
  },
  dashboard: {
    label: 'Dashboard',
    route: '/dashboard',
    exportActions: {
      pdf: 'dashboard.export.pdf',
    },
  },
  flagged_items: {
    label: 'Flagged Items',
    route: '/flagged-items',
    exportActions: {
      pdf: 'flagged_items.export.pdf',
    },
  },
  inspection_report: {
    label: 'Inspection Report',
    route: '/inspection',
    exportActions: {
      pdf: 'inspection_report.download.pdf',
      docx: 'inspection_report.download.docx',
    },
  },
};

export const fieldBelongsToRegistry = (fieldId) => {
  if (!fieldId || typeof fieldId !== 'string') return false;
  if (utilityFieldPrefixes.some(prefix => fieldId.startsWith(prefix))) return true;
  return Object.values(agentPages).some(page => {
    if (page.searchField === fieldId) return true;
    if (page.formKey && fieldId.startsWith(`${page.formKey}.`)) return true;
    return Object.values(page.filters || {}).some(filterId => fieldId === filterId || fieldId.startsWith(`${filterId}.`));
  });
};

export const actionBelongsToRegistry = (actionId) => {
  if (!actionId || typeof actionId !== 'string') return false;
  if (documentExportActions.includes(actionId)) return true;
  return Object.values(agentPages).some(page => (
    page.createAction === actionId ||
    page.filterAction === actionId ||
    page.submitAction === actionId ||
    Object.values(page.filters || {}).includes(actionId) ||
    Object.values(page.exportActions || {}).includes(actionId)
  ));
};
