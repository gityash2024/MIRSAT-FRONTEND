export const getTemplateAssetType = (template = {}) => String(template?.type || '').trim();

export const filterAssetsForTemplateType = (assets = [], templateType = '') => {
  const normalizedTemplateType = String(templateType || '').trim().toLocaleLowerCase();
  if (!normalizedTemplateType) return [];

  return (assets || []).filter((asset) => (
    String(asset?.type || '').trim().toLocaleLowerCase() === normalizedTemplateType
  ));
};
