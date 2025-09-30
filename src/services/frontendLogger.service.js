import api from './api';

class FrontendLogger {
  // Log frontend user activities
  static async logActivity(activityData) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user._id) {
        console.warn('No user found for logging activity');
        return;
      }

      const logData = {
        userId: user._id,
        action: activityData.action,
        description: activityData.description,
        details: activityData.details || {},
        module: activityData.module || 'frontend',
        severity: activityData.severity || 'low',
        metadata: {
          ...activityData.metadata,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      };

      // Send to backend logging endpoint
      await api.post('/logs/frontend', logData);
    } catch (error) {
      console.error('Failed to log frontend activity:', error);
      // Don't throw error to avoid breaking user experience
    }
  }

  // Authentication activities
  static async logLogin(email, success = true) {
    await this.logActivity({
      action: success ? 'user_login' : 'user_login_failed',
      description: success ? `User logged in successfully` : `Failed login attempt for ${email}`,
      module: 'auth',
      severity: success ? 'low' : 'medium',
      details: { email, success }
    });
  }

  static async logLogout() {
    await this.logActivity({
      action: 'user_logout',
      description: 'User logged out',
      module: 'auth',
      severity: 'low'
    });
  }

  static async logPasswordChange() {
    await this.logActivity({
      action: 'password_changed',
      description: 'User changed password',
      module: 'profile',
      severity: 'medium'
    });
  }

  // Task activities
  static async logTaskView(taskId, taskTitle) {
    await this.logActivity({
      action: 'task_viewed',
      description: `Viewed task: ${taskTitle}`,
      module: 'tasks',
      details: { taskId, taskTitle }
    });
  }

  static async logTaskStart(taskId, taskTitle) {
    await this.logActivity({
      action: 'task_started',
      description: `Started task: ${taskTitle}`,
      module: 'user_tasks',
      details: { taskId, taskTitle }
    });
  }

  static async logTaskProgressUpdate(taskId, taskTitle, subLevelName, oldStatus, newStatus) {
    await this.logActivity({
      action: 'task_progress_updated',
      description: `Updated progress for "${subLevelName}" in task "${taskTitle}" from ${oldStatus} to ${newStatus}`,
      module: 'user_tasks',
      details: { taskId, taskTitle, subLevelName, oldStatus, newStatus }
    });
  }

  static async logTaskComplete(taskId, taskTitle) {
    await this.logActivity({
      action: 'task_completed',
      description: `Completed task: ${taskTitle}`,
      module: 'user_tasks',
      severity: 'medium',
      details: { taskId, taskTitle }
    });
  }

  static async logTaskArchive(taskId, taskTitle) {
    await this.logActivity({
      action: 'task_archived',
      description: `Archived task: ${taskTitle}`,
      module: 'user_tasks',
      details: { taskId, taskTitle }
    });
  }

  static async logSignatureAdded(taskId, taskTitle) {
    await this.logActivity({
      action: 'task_signature_added',
      description: `Added signature to task: ${taskTitle}`,
      module: 'user_tasks',
      severity: 'medium',
      details: { taskId, taskTitle }
    });
  }

  // User management activities
  static async logUserCreate(userData) {
    await this.logActivity({
      action: 'user_created',
      description: `Created new user: ${userData.name} (${userData.email})`,
      module: 'users',
      severity: 'medium',
      details: { userId: userData._id, name: userData.name, email: userData.email, role: userData.role }
    });
  }

  static async logUserUpdate(userId, userData, changes) {
    await this.logActivity({
      action: 'user_updated',
      description: `Updated user: ${userData.name}`,
      module: 'users',
      details: { userId, name: userData.name, email: userData.email, changes }
    });
  }

  static async logUserDelete(userId, userName) {
    await this.logActivity({
      action: 'user_deleted',
      description: `Deleted user: ${userName}`,
      module: 'users',
      severity: 'high',
      details: { userId, userName }
    });
  }

  // Asset management activities
  static async logAssetCreate(assetData) {
    await this.logActivity({
      action: 'asset_created',
      description: `Created new asset: ${assetData.name}`,
      module: 'assets',
      details: { assetId: assetData._id, name: assetData.name, type: assetData.type }
    });
  }

  static async logAssetUpdate(assetId, assetName, changes) {
    await this.logActivity({
      action: 'asset_updated',
      description: `Updated asset: ${assetName}`,
      module: 'assets',
      details: { assetId, assetName, changes }
    });
  }

  static async logAssetDelete(assetId, assetName) {
    await this.logActivity({
      action: 'asset_deleted',
      description: `Deleted asset: ${assetName}`,
      module: 'assets',
      severity: 'high',
      details: { assetId, assetName }
    });
  }

  // Inspection activities
  static async logInspectionCreate(inspectionData) {
    await this.logActivity({
      action: 'inspection_created',
      description: `Created new inspection: ${inspectionData.title}`,
      module: 'inspection',
      details: { inspectionId: inspectionData._id, title: inspectionData.title }
    });
  }

  static async logInspectionUpdate(inspectionId, inspectionTitle, changes) {
    await this.logActivity({
      action: 'inspection_updated',
      description: `Updated inspection: ${inspectionTitle}`,
      module: 'inspection',
      details: { inspectionId, inspectionTitle, changes }
    });
  }

  static async logInspectionComplete(inspectionId, inspectionTitle) {
    await this.logActivity({
      action: 'inspection_completed',
      description: `Completed inspection: ${inspectionTitle}`,
      module: 'inspection',
      severity: 'medium',
      details: { inspectionId, inspectionTitle }
    });
  }

  // Questionnaire activities
  static async logQuestionnaireResponse(taskId, taskTitle, questionId, response) {
    await this.logActivity({
      action: 'questionnaire_response',
      description: `Answered questionnaire for task: ${taskTitle}`,
      module: 'questionnaires',
      details: { taskId, taskTitle, questionId, response }
    });
  }

  static async logQuestionnaireComplete(taskId, taskTitle) {
    await this.logActivity({
      action: 'questionnaire_completed',
      description: `Completed questionnaire for task: ${taskTitle}`,
      module: 'questionnaires',
      severity: 'medium',
      details: { taskId, taskTitle }
    });
  }

  // Report activities
  static async logReportGenerate(reportType, filters) {
    await this.logActivity({
      action: 'report_generated',
      description: `Generated ${reportType} report`,
      module: 'reports',
      details: { reportType, filters }
    });
  }

  static async logReportExport(reportType, format) {
    await this.logActivity({
      action: 'report_exported',
      description: `Exported ${reportType} report as ${format}`,
      module: 'reports',
      details: { reportType, format }
    });
  }

  // Settings activities
  static async logSettingsUpdate(settingsType, changes) {
    await this.logActivity({
      action: 'settings_updated',
      description: `Updated ${settingsType} settings`,
      module: 'settings',
      details: { settingsType, changes }
    });
  }

  // Role and permission activities
  static async logRoleCreate(roleData) {
    await this.logActivity({
      action: 'role_created',
      description: `Created new role: ${roleData.name}`,
      module: 'roles',
      severity: 'medium',
      details: { roleId: roleData._id, name: roleData.name, permissions: roleData.permissions }
    });
  }

  static async logRoleUpdate(roleId, roleName, changes) {
    await this.logActivity({
      action: 'role_updated',
      description: `Updated role: ${roleName}`,
      module: 'roles',
      severity: 'medium',
      details: { roleId, roleName, changes }
    });
  }

  static async logPermissionUpdate(userId, userName, permissionChanges) {
    await this.logActivity({
      action: 'permissions_updated',
      description: `Updated permissions for user: ${userName}`,
      module: 'roles',
      severity: 'high',
      details: { userId, userName, permissionChanges }
    });
  }

  // Dashboard activities
  static async logDashboardView(dashboardType) {
    await this.logActivity({
      action: 'dashboard_viewed',
      description: `Viewed ${dashboardType} dashboard`,
      module: 'dashboard',
      details: { dashboardType }
    });
  }

  // File upload activities
  static async logFileUpload(fileName, fileType, module) {
    await this.logActivity({
      action: 'file_uploaded',
      description: `Uploaded file: ${fileName}`,
      module: module || 'files',
      details: { fileName, fileType }
    });
  }

  static async logFileDelete(fileName, module) {
    await this.logActivity({
      action: 'file_deleted',
      description: `Deleted file: ${fileName}`,
      module: module || 'files',
      details: { fileName }
    });
  }

  // Search activities
  static async logSearch(searchTerm, module, resultsCount) {
    await this.logActivity({
      action: 'search_performed',
      description: `Searched for: "${searchTerm}" in ${module}`,
      module: module || 'search',
      details: { searchTerm, resultsCount }
    });
  }

  // Filter activities
  static async logFilterApplied(filters, module) {
    await this.logActivity({
      action: 'filters_applied',
      description: `Applied filters in ${module}`,
      module: module || 'filters',
      details: { filters }
    });
  }

  // Error activities
  static async logError(error, module, context) {
    await this.logActivity({
      action: 'error_occurred',
      description: `Error in ${module}: ${error.message}`,
      module: module || 'errors',
      severity: 'high',
      details: { error: error.message, stack: error.stack, context }
    });
  }

  // Navigation activities
  static async logNavigation(from, to) {
    await this.logActivity({
      action: 'navigation',
      description: `Navigated from ${from} to ${to}`,
      module: 'navigation',
      details: { from, to }
    });
  }

  // Session activities
  static async logSessionStart() {
    await this.logActivity({
      action: 'session_started',
      description: 'User session started',
      module: 'session',
      details: { sessionId: Date.now() }
    });
  }

  static async logSessionTimeout() {
    await this.logActivity({
      action: 'session_timeout',
      description: 'User session timed out',
      module: 'session',
      severity: 'medium'
    });
  }
}

export default FrontendLogger;
