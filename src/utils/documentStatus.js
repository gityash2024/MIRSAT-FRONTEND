export const documentStatus = (document, now = Date.now()) => {
  if ([document.expiryDate, document.reviewDate].some(value => value && new Date(value).getTime() < now)) return 'overdue';
  if (document.expiryDate && new Date(document.expiryDate).getTime() <= now + 60 * 86400000) return 'expiring';
  return document.controlled ? 'controlled' : 'current';
};
