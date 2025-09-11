// Z-Index hierarchy for consistent layering
export const Z_INDEX = {
  // Base layers
  DROPDOWN: 100,
  POPOVER: 200,
  TOOLTIP: 300,
  
  // Modal layers
  MODAL: 1000,
  MODAL_OVERLAY: 9999,
  
  // Confirmation and alert modals (highest priority)
  CONFIRMATION_MODAL: 10000,
  ALERT_MODAL: 10000,
  
  // Special cases
  LOADING_OVERLAY: 99999,
  DEBUG_OVERLAY: 100000
};

export default Z_INDEX;
