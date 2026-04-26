import ArabicReshaper from 'arabic-reshaper';

export const EXPORT_LANGUAGES = {
  EN: 'en',
  AR: 'ar'
};

export const normalizeExportLanguage = (language) => (
  language === EXPORT_LANGUAGES.AR ? EXPORT_LANGUAGES.AR : EXPORT_LANGUAGES.EN
);

export const isArabicExport = (language) => normalizeExportLanguage(language) === EXPORT_LANGUAGES.AR;

export const containsArabic = (text) => {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(String(text));
};

export const formatPdfText = (value, language = EXPORT_LANGUAGES.EN) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (!isArabicExport(language) && !containsArabic(text)) return text;

  try {
    return ArabicReshaper.convertArabic(text);
  } catch (error) {
    return text;
  }
};

export const loadPdfArabicFont = async (doc) => {
  const sources = [
    `${window.location.origin}/fonts/Amiri-Regular.ttf`,
    'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf'
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source);
      if (!response.ok) continue;

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });

      doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', btoa(binary));
      doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
      return true;
    } catch (error) {
      // Try the next source.
    }
  }

  return false;
};

export const setPdfFontForLanguage = (doc, language, fontLoaded, style = 'normal') => {
  if (isArabicExport(language) && fontLoaded) {
    doc.setFont('NotoNaskhArabic', 'normal');
  } else {
    doc.setFont('helvetica', style);
  }
};

export const localizePdfTable = (data, language, fontLoaded) => {
  if (!data?.cell) return;
  const rawText = Array.isArray(data.cell.raw) ? data.cell.raw.join(' ') : data.cell.raw;
  const shouldUseArabicFont = isArabicExport(language) || containsArabic(rawText);

  if (shouldUseArabicFont && fontLoaded) {
    data.cell.styles.font = 'NotoNaskhArabic';
    data.cell.styles.fontStyle = 'normal';
  }

  if (isArabicExport(language)) {
    data.cell.styles.halign = 'right';
  }
};

export const orderForLanguage = (items, language) => (
  isArabicExport(language) ? [...items].reverse() : items
);

export const orderRowsForLanguage = (rows, language) => (
  isArabicExport(language) ? rows.map((row) => [...row].reverse()) : rows
);

const TEXT = {
  en: {
    na: 'N/A',
    generatedOn: 'Generated on',
    generatedOnColon: 'Generated on:',
    generated: 'Generated',
    page: 'Page',
    of: 'of',
    total: 'Total',
    completed: 'Completed',
    pending: 'Pending',
    active: 'Active',
    inactive: 'Inactive',
    draft: 'Draft',
    archived: 'Archived',
    inProgress: 'In Progress',
    delayed: 'Delayed',
    cancelled: 'Cancelled',
    never: 'Never',
    notSpecified: 'Not specified',
    unassigned: 'Unassigned',
    untitled: 'Untitled',
    status: 'Status',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    dashboardReport: 'Dashboard Report',
    metric: 'Metric',
    property: 'Property',
    value: 'Value',
    totalTasks: 'Total Tasks',
    completedTasks: 'Completed Tasks',
    pendingTasks: 'Pending Tasks',
    delayedInspections: 'Delayed Inspections',
    flaggedItems: 'Flagged Items',
    upcomingInspections: 'Upcoming Inspections',
    inspectionName: 'Inspection Name',
    date: 'Date',
    assetType: 'Asset Type',
    city: 'City',
    location: 'Location',
    createdAt: 'Created At',
    closedAt: 'Closed At',
    department: 'Department',
    duration: 'Duration',
    signature: 'Signature',
    signedAt: 'Signed at',
    captured: 'Captured',
    coordinates: 'Coordinates',
    unavailable: 'Unavailable',
    flaggedItemsSummary: 'Flagged Items Summary',
    flaggedItemsReport: 'Flagged Items Report',
    task: 'Task',
    template: 'Template',
    asset: 'Asset',
    inspector: 'Inspector',
    question: 'Question',
    answer: 'Answer',
    response: 'Response',
    itemNo: 'Item No.',
    checkpoint: 'Checkpoint',
    pageLabel: 'Page',
    section: 'Section',
    preInspectionQuestionnaire: 'Pre-inspection questionnaire',
    noFlaggedItems: 'No flagged items for this inspection',
    taskReport: 'MIRSAT - Task Report',
    title: 'Title',
    assignee: 'Assignee',
    assignedTo: 'Assigned To',
    dueDate: 'Due Date',
    deadline: 'Deadline',
    progress: 'Progress',
    description: 'Description',
    calendarEventsReport: 'Calendar Events Report',
    eventsSummary: 'Events Summary',
    totalEvents: 'Total Events',
    pendingEvents: 'Pending Events',
    completedEvents: 'Completed Events',
    highPriorityEvents: 'High Priority Events',
    userManagementReport: 'User Management Report',
    userManagementFooter: 'MIRSAT User Management Report',
    summary: 'Summary',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    inactiveUsers: 'Inactive Users',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    lastActive: 'Last Active',
    inspectionReport: 'Inspection Report',
    totalScore: 'Total Score',
    category: 'Category',
    comment: 'Comment',
    imageUploaded: 'Image uploaded',
    fileUploaded: 'File uploaded',
    noResponse: 'No response',
    digitallySigned: 'Digitally Signed',
    overview: 'Overview',
    score: 'Score',
    completion: 'Completion',
    notCompleted: 'Not completed',
    inspectionSections: 'Inspection Sections',
    unnamedSection: 'Unnamed Section'
  },
  ar: {
    na: 'غير متوفر',
    generatedOn: 'تم الإنشاء في',
    generatedOnColon: 'تم الإنشاء في:',
    generated: 'تم الإنشاء',
    page: 'صفحة',
    of: 'من',
    total: 'الإجمالي',
    completed: 'مكتمل',
    pending: 'قيد الانتظار',
    active: 'نشط',
    inactive: 'غير نشط',
    draft: 'مسودة',
    archived: 'مؤرشف',
    inProgress: 'قيد التنفيذ',
    delayed: 'متأخر',
    cancelled: 'ملغي',
    never: 'أبداً',
    notSpecified: 'غير محدد',
    unassigned: 'غير معين',
    untitled: 'بدون عنوان',
    status: 'الحالة',
    priority: 'الأولوية',
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة',
    dashboardReport: 'تقرير لوحة التحكم',
    metric: 'المؤشر',
    property: 'الخاصية',
    value: 'القيمة',
    totalTasks: 'إجمالي المهام',
    completedTasks: 'المهام المكتملة',
    pendingTasks: 'المهام المعلقة',
    delayedInspections: 'عمليات التفتيش المتأخرة',
    flaggedItems: 'العناصر المعلّمة',
    upcomingInspections: 'عمليات التفتيش القادمة',
    inspectionName: 'اسم التفتيش',
    date: 'التاريخ',
    assetType: 'نوع الأصل',
    city: 'المدينة',
    location: 'الموقع',
    createdAt: 'تاريخ الإنشاء',
    closedAt: 'تاريخ الإغلاق',
    department: 'القسم',
    duration: 'المدة',
    signature: 'التوقيع',
    signedAt: 'وقت التوقيع',
    captured: 'تم الالتقاط',
    coordinates: 'الإحداثيات',
    unavailable: 'غير متاح',
    flaggedItemsSummary: 'ملخص العناصر المعلّمة',
    flaggedItemsReport: 'تقرير العناصر المعلّمة',
    task: 'المهمة',
    template: 'القالب',
    asset: 'الأصل',
    inspector: 'المفتش',
    question: 'السؤال',
    answer: 'الإجابة',
    response: 'الإجابة',
    itemNo: 'رقم العنصر',
    checkpoint: 'نقطة الفحص',
    pageLabel: 'صفحة',
    section: 'قسم',
    preInspectionQuestionnaire: 'استبيان ما قبل التفتيش',
    noFlaggedItems: 'لا توجد عناصر معلّمة لهذا التفتيش',
    taskReport: 'مرصد - تقرير المهام',
    title: 'العنوان',
    assignee: 'المكلف',
    assignedTo: 'مكلف إلى',
    dueDate: 'تاريخ الاستحقاق',
    deadline: 'الموعد النهائي',
    progress: 'التقدم',
    description: 'الوصف',
    calendarEventsReport: 'تقرير أحداث التقويم',
    eventsSummary: 'ملخص الأحداث',
    totalEvents: 'إجمالي الأحداث',
    pendingEvents: 'الأحداث المعلقة',
    completedEvents: 'الأحداث المكتملة',
    highPriorityEvents: 'الأحداث عالية الأولوية',
    userManagementReport: 'تقرير إدارة المستخدمين',
    userManagementFooter: 'مرصد - تقرير إدارة المستخدمين',
    summary: 'الملخص',
    totalUsers: 'إجمالي المستخدمين',
    activeUsers: 'المستخدمون النشطون',
    inactiveUsers: 'المستخدمون غير النشطين',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    lastActive: 'آخر نشاط',
    inspectionReport: 'تقرير التفتيش',
    totalScore: 'النتيجة الإجمالية',
    category: 'الفئة',
    comment: 'تعليق',
    imageUploaded: 'تم رفع صورة',
    fileUploaded: 'تم رفع ملف',
    noResponse: 'لا توجد إجابة',
    digitallySigned: 'موقع رقمياً',
    overview: 'نظرة عامة',
    score: 'النتيجة',
    completion: 'الإكمال',
    notCompleted: 'غير مكتمل',
    inspectionSections: 'أقسام التفتيش',
    unnamedSection: 'قسم غير مسمى'
  }
};

export const exportText = (language, key) => {
  const normalized = normalizeExportLanguage(language);
  return TEXT[normalized]?.[key] || TEXT.en[key] || key;
};

export const formatExportDate = (value, language = EXPORT_LANGUAGES.EN, options = {}) => {
  if (!value) return exportText(language, 'na');
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  if (!isArabicExport(language)) {
    return options.includeTime ? date.toLocaleString() : date.toLocaleDateString();
  }

  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(options.includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  }).format(date);
};

export const formatStatusForExport = (status, language = EXPORT_LANGUAGES.EN) => {
  if (!status) return exportText(language, 'na');
  const normalized = String(status).trim().toLowerCase().replace(/\s+/g, '_');
  const statusMap = {
    completed: exportText(language, 'completed'),
    archived: exportText(language, 'archived'),
    pending: exportText(language, 'pending'),
    active: exportText(language, 'active'),
    inactive: exportText(language, 'inactive'),
    draft: exportText(language, 'draft'),
    in_progress: exportText(language, 'inProgress'),
    delayed: exportText(language, 'delayed'),
    cancelled: exportText(language, 'cancelled'),
    canceled: exportText(language, 'cancelled')
  };

  if (statusMap[normalized]) return statusMap[normalized];
  if (isArabicExport(language)) return String(status).replace(/_/g, ' ');
  return String(status).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const formatPriorityForExport = (priority, language = EXPORT_LANGUAGES.EN) => {
  if (!priority) return exportText(language, 'na');
  const normalized = String(priority).trim().toLowerCase();
  const priorityMap = {
    high: exportText(language, 'high'),
    medium: exportText(language, 'medium'),
    low: exportText(language, 'low')
  };

  if (priorityMap[normalized]) return priorityMap[normalized];
  if (isArabicExport(language)) return String(priority);
  return String(priority).charAt(0).toUpperCase() + String(priority).slice(1);
};

export const buildCsvContent = (rows, language = EXPORT_LANGUAGES.EN) => {
  const csvContent = rows.map((row) => (
    row.map((cell) => {
      const escaped = String(cell ?? '').replace(/"/g, '""');
      return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',')
  )).join('\n');

  return isArabicExport(language) ? `\uFEFF${csvContent}` : csvContent;
};

export const downloadCsv = (rows, fileName, language = EXPORT_LANGUAGES.EN) => {
  const blob = new Blob([buildCsvContent(rows, language)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
