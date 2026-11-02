import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import { createInstance } from 'i18next';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const languages = ['en', 'ar'];
export const namespaces = ['translation', 'maintenance'];
export const loadResources = (root = projectRoot) => Object.fromEntries(languages.map(language => [language,
  Object.fromEntries(namespaces.map(namespace => [namespace, JSON.parse(fs.readFileSync(path.join(root,
    `src/locales/${namespace === 'maintenance' ? 'maintenance.' : ''}${language}.json`), 'utf8'))])),
]));

const walk = (node, visit) => {
  if (!node || typeof node !== 'object') return;
  if (node.type) visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'start', 'end', 'extra', 'comments', 'tokens'].includes(key)) continue;
    if (Array.isArray(value)) value.forEach(child => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
};
const propertyName = node => node?.name || node?.value;
const option = (node, key) => node?.type === 'ObjectExpression'
  ? node.properties.find(property => propertyName(property.key) === key)?.value : undefined;
const literals = node => {
  if (!node) return [];
  if (node.type === 'StringLiteral') return [node.value];
  if (node.type === 'TemplateLiteral' && !node.expressions.length) return [node.quasis[0].value.cooked];
  if (node.type === 'ConditionalExpression') return [...literals(node.consequent), ...literals(node.alternate)];
  if (node.type === 'LogicalExpression') return [...literals(node.left), ...literals(node.right)];
  if (node.type === 'ArrayExpression') return node.elements.flatMap(literals);
  return [];
};
const readable = text => text.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());

// Finite backend values rendered through dynamic translation keys. User-entered
// names, descriptions and record values are intentionally never translated.
export const dynamicContracts = {
  translation: [
    ...['superadmin', 'admin', 'manager', 'supervisor', 'inspector', 'user', 'role', 'status', 'draft', 'published', 'active', 'inactive'].map(value => `common.${value}`),
    'dashboard.taskCountSingular', 'dashboard.taskCountPlural',
    ...['ksa', 'us', 'india', 'gmt'].flatMap(value => [`timezones.${value}.label`, `timezones.${value}.name`]),
  ],
  maintenance: [
    ...['low', 'medium', 'high', 'critical', 'open', 'under_assessment', 'in_progress', 'resolved', 'closed',
      'pending', 'completed', 'cancelled', 'archived', 'incomplete', 'partially_completed', 'active', 'maintenance',
      'inactive', 'retired', 'equipment', 'component', 'tool', 'text', 'number', 'date', 'boolean', 'file',
      'approved', 'rejected', 'receipt', 'reserve', 'reservation', 'issue', 'return', 'transfer', 'adjustment', 'release'].map(readable),
    'Certificates', 'Manuals', 'Policies & SOPs', 'Inspection Records', 'Other Records',
  ],
};

export function collectReferences(source, file) {
  const ast = parse(source, { sourceType: 'unambiguous', plugins: ['jsx', 'typescript'] });
  const references = [], dynamic = [], declarations = new Map();
  const maintenance = file.includes('/maintenance/') || file.endsWith('/services/documentRegister.js');
  const add = (key, namespace, node) => {
    if (key?.trim() && key !== '#') references.push({ key, namespace, file, line: node.loc.start.line });
  };
  walk(ast, node => {
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') declarations.set(node.id.name, node.init);
  });
  walk(ast, node => {
    if (node.type === 'CallExpression') {
      const fn = node.callee.type === 'Identifier' ? node.callee.name
        : node.callee.type === 'MemberExpression' && propertyName(node.callee.property) === 't' ? 't' : null;
      if (fn === 't' || (fn === 'm' && maintenance)) {
        const namespace = literals(option(node.arguments[1], 'ns'))[0]
          || (fn === 'm' || file.endsWith('/maintenance/shared.jsx') ? 'maintenance' : 'translation');
        const keys = literals(node.arguments[0]);
        keys.forEach(key => add(key, namespace, node));
        if (!keys.length) dynamic.push({ file, line: node.loc.start.line, namespace,
          expression: source.slice(node.arguments[0]?.start, node.arguments[0]?.end) });
        const argument = node.arguments[0];
        if (maintenance && argument?.type === 'MemberExpression') {
          const object = argument.object.type === 'Identifier' ? declarations.get(argument.object.name) : argument.object;
          if (object?.type === 'ObjectExpression') object.properties.forEach(property =>
            literals(property.value).forEach(key => add(key, namespace, node)));
        }
      }
      // Template transfer passes its error suffix through a helper.
      if (fn === 'fail' && file.endsWith('/templateTransfer.js')) literals(node.arguments[1])
        .forEach(key => add(`templateTransfer.${key}`, 'translation', node));
      if (maintenance && fn === 'field') literals(node.arguments[1]).forEach(key => add(key, 'maintenance', node));
      // Copy passed through table tuples or array maps, rather than m("...").
      if (maintenance && node.callee.type === 'MemberExpression' && propertyName(node.callee.property) === 'map') {
        const list = node.callee.object.type === 'Identifier' ? declarations.get(node.callee.object.name) : node.callee.object;
        const callback = node.arguments[0];
        if (list?.type === 'ArrayExpression' && ['ArrowFunctionExpression', 'FunctionExpression'].includes(callback?.type)) {
          const translated = new Set(), formatted = new Set();
          walk(callback.body, child => {
            if (child.type !== 'CallExpression') return;
            if (child.callee.name === 'm' && child.arguments[0]?.type === 'Identifier') translated.add(child.arguments[0].name);
            if (child.callee.name === 'readable' && child.arguments[0]?.type === 'Identifier') formatted.add(child.arguments[0].name);
          });
          const parameter = callback.params[0];
          if (parameter?.type === 'Identifier') {
            if (translated.has(parameter.name)) literals(list).forEach(key => add(key, 'maintenance', node));
            if (formatted.has(parameter.name)) literals(list).forEach(key => add(readable(key), 'maintenance', node));
          }
          if (parameter?.type === 'ArrayPattern') parameter.elements.forEach((element, index) => {
            if (translated.has(element?.name)) list.elements.filter(row => row?.type === 'ArrayExpression')
              .forEach(row => literals(row.elements[index]).forEach(key => add(key, 'maintenance', node)));
          });
        }
      }
    }
    // Default-namespace keys carried in calendar/import configuration objects.
    if (node.type === 'StringLiteral' && /\/(templateExcelImport|calendarEvents)\.js$/.test(file)
      && /^(inspections|tasks|calendar)\.[a-zA-Z]/.test(node.value)) {
      add(node.value, 'translation', node);
    }
    if (maintenance && node.type === 'ObjectProperty' && ['label', 'placeholder', 'submitLabel', 'success'].includes(propertyName(node.key))) {
      literals(node.value).forEach(key => add(key, 'maintenance', node));
    }
    if (maintenance && node.type === 'JSXAttribute' && ['title', 'subtitle', 'submitLabel', 'placeholder', 'first', 'second'].includes(propertyName(node.name))) {
      literals(node.value).forEach(key => add(key, 'maintenance', node));
    }
  });
  return { references, dynamic };
}
const sourceFiles = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? sourceFiles(path.join(directory, entry.name))
    : /\.[jt]sx?$/.test(entry.name) && !/\.(test|spec)\.[jt]sx?$/.test(entry.name) ? [path.join(directory, entry.name)] : []);
export function collectProjectReferences(root = projectRoot) {
  const references = [], dynamic = [];
  for (const file of sourceFiles(path.join(root, 'src'))) {
    const result = collectReferences(fs.readFileSync(file, 'utf8'), path.relative(root, file));
    references.push(...result.references); dynamic.push(...result.dynamic);
  }
  for (const [namespace, keys] of Object.entries(dynamicContracts)) keys.forEach(key =>
    references.push({ key, namespace, file: 'dynamic contracts', line: 1 }));
  return { references, dynamic };
}
export function flatten(catalog, prefix = '') {
  return Object.fromEntries(Object.entries(catalog).flatMap(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' ? Object.entries(flatten(value, full)) : [[full, value]];
  }));
}
const placeholders = value => [...value.matchAll(/{{\s*([^}]+?)\s*}}/g)].map(match => match[1]).sort().join('|');
export async function auditTranslations(resources, references) {
  const errors = new Set();
  for (const namespace of namespaces) {
    const catalogs = Object.fromEntries(languages.map(language => [language, flatten(resources[language][namespace])]));
    const keys = new Set(languages.flatMap(language => Object.keys(catalogs[language])));
    for (const key of keys) {
      for (const language of languages) {
        const value = catalogs[language][key];
        if (typeof value !== 'string' || !value.trim()) errors.add(`${language}:${namespace}:${key} is missing or empty`);
        if (value === key && key.includes('.') && namespace === 'translation') errors.add(`${language}:${namespace}:${key} contains its raw key`);
      }
      const en = catalogs.en[key], ar = catalogs.ar[key];
      if (typeof en === 'string' && typeof ar === 'string' && placeholders(en) !== placeholders(ar)) {
        errors.add(`${namespace}:${key} has different interpolation placeholders`);
      }
    }
  }
  for (const language of languages) {
    const i18n = createInstance();
    await i18n.init({ lng: language, fallbackLng: false, resources, defaultNS: 'translation', initAsync: false });
    for (const ref of references) {
      const options = { ns: ref.namespace, keySeparator: ref.namespace === 'maintenance' ? false : '.', count: 2 };
      const value = i18n.t(ref.key, options);
      if (!i18n.exists(ref.key, options) || typeof value !== 'string' || !value.trim()) {
        errors.add(`${language}:${ref.namespace}:${ref.key} unresolved at ${ref.file}:${ref.line}`);
      }
    }
  }
  return [...errors];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const resources = loadResources();
  const { references, dynamic } = collectProjectReferences();
  const errors = await auditTranslations(resources, references);
  console.log(`Translation audit: ${references.length} source/contract references, ${dynamic.length} dynamic call sites, ${languages.length} languages, ${namespaces.length} namespaces.`);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('All checked references resolve without language fallback. Catalog keys and interpolation placeholders match.');
}
