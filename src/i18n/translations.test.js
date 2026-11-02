// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createInstance } from 'i18next';
import { auditTranslations, collectProjectReferences, collectReferences, loadResources } from '../../scripts/check-translations.mjs';

const resources = loadResources();

describe('web translation coverage', () => {
  it('resolves all source keys and known dynamic values in each language without fallback', async () => {
    const { references } = collectProjectReferences();
    expect(await auditTranslations(resources, references)).toEqual([]);
  });

  it('checks explicit namespaces and indirect maintenance copy without mistaking agent selectors for keys', () => {
    const { references } = collectReferences(`
      t('Documents', { ns: 'maintenance' });
      t(condition ? 'common.yes' : 'common.no');
      const labels = { issue: 'Issue Stock' };
      m(labels[type]);
      field('title', 'Fault Title');
      const element = <input data-agent-id="tasks.form.title" placeholder="Search" />;
    `, 'src/pages/maintenance/Example.jsx');
    expect(references.map(({ key, namespace }) => [key, namespace])).toEqual(expect.arrayContaining([
      ['Documents', 'maintenance'], ['common.yes', 'translation'], ['common.no', 'translation'],
      ['Issue Stock', 'maintenance'], ['Fault Title', 'maintenance'], ['Search', 'maintenance'],
    ]));
    expect(references.some(({ key }) => key === 'tasks.form.title')).toBe(false);
  });

  it('fails for a missing entry even when English fallback or a default label could hide it', async () => {
    const changed = structuredClone(resources);
    delete changed.ar.translation.dashboard.noTemplateData;
    const { references } = collectReferences("t('dashboard.noTemplateData', {defaultValue: 'No data'})", 'src/Example.jsx');
    expect(await auditTranslations(changed, references)).toEqual(expect.arrayContaining([
      expect.stringContaining('ar:translation:dashboard.noTemplateData unresolved'),
    ]));
  });

  it('catches missing interpolation variables and empty translations', async () => {
    const changed = structuredClone(resources);
    changed.ar.translation.common.timezoneChanged = 'تم التغيير';
    changed.ar.maintenance.Attachments = '';
    expect(await auditTranslations(changed, [])).toEqual(expect.arrayContaining([
      expect.stringContaining('common.timezoneChanged has different interpolation placeholders'),
      expect.stringContaining('ar:maintenance:Attachments is missing or empty'),
    ]));
  });

  it.each(['en', 'ar'])('renders dashboard empty state and interpolated messages in %s', async lng => {
    const i18n = createInstance();
    await i18n.init({ lng, fallbackLng: false, resources });
    expect(i18n.t('dashboard.noTemplateData')).toBe(lng === 'ar'
      ? 'لا تتوفر بيانات فحوصات للقوالب' : 'No inspection data available for templates');
    expect(i18n.t('common.timezoneChanged', { timezone: 'GMT' })).toContain('GMT');
    for (const count of [0, 1, 2, 3, 11, 100]) {
      const key = count === 1 ? 'dashboard.taskCountSingular' : 'dashboard.taskCountPlural';
      const text = i18n.t(key, { count });
      expect(text).toContain(String(count));
      expect(text).not.toContain('dashboard.');
      expect(text).not.toContain('{{');
    }
  });
});
