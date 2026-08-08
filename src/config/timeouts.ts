/**
 * Centralized timeout configuration for test execution
 * All wait times should use these constants to ensure consistency
 */

export const TIMEOUTS = {
  // Navigation and page loads
  PAGE_LOAD: 30000,
  URL_WAIT: 60000,

  // Element visibility and readiness
  ELEMENT_APPEAR: 5000,
  ELEMENT_DISAPPEAR: 5000,
  ELEMENT_VISIBLE: 60000,
  ELEMENT_HIDDEN: 5000,
  ELEMENT_ENABLED: 5000,

  // Popup and modal handling
  POPUP_APPEAR: 2000,
  POPUP_DISAPPEAR: 3000,

  // Loading spinners and overlays
  LOADING_OVERLAY_DISAPPEAR: 5000,
  SKELETON_DISAPPEAR: 8000,

  // Grid and data table operations
  GRID_LOAD: 10000,
  GRID_CELL_APPEAR: 5000,

  // Form operations
  FORM_SUBMIT: 10000,
  FORM_VALIDATION: 3000,

  // File operations
  FILE_DOWNLOAD: 15000,
  FILE_UPLOAD: 10000,

  // API requests
  API_REQUEST: 20000,

  // General arbitrary waits
  SMALL_WAIT: 500,
  MEDIUM_WAIT: 2000,
  LARGE_WAIT: 5000
};
