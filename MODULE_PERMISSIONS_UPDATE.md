# Module-Level Permissions Update for Manager Role

## Overview
This update implements simplified module-level permissions for Manager users, while keeping Admin, SuperAdmin, and Inspector roles unchanged with their existing permissions.

## Key Changes Made

### 1. Frontend Changes

#### A. Updated Permissions Structure (`src/utils/permissions.js`)
- **Added**: `MODULE_PERMISSIONS` constant with 8 module-level permissions:
  - `DASHBOARD`: 'access_dashboard'
  - `TASKS`: 'access_tasks' 
  - `USERS`: 'access_users'
  - `TEMPLATE`: 'access_template'
  - `ASSETS`: 'access_assets'
  - `QUESTIONNAIRES`: 'access_questionnaires'
  - `CALENDAR`: 'access_calendar'
  - `PROFILE`: 'access_profile'

- **Added**: `hasModuleAccess(user, module)` helper function
  - Admin and Inspector: Access to all modules
  - Manager: Access based on assigned module permissions

#### B. Updated Sidebar (`src/layouts/SideBar/index.jsx`)
- **Enhanced**: Menu item filtering for managers using module permissions
- **Added**: New module mappings for each sidebar item
- **Updated**: Icons for Assets (Package) and Profile (User) modules

#### C. Updated User Creation Form (`src/pages/users/components/UserForm.jsx`)
- **Added**: `renderModulePermissions()` function for clean module display
- **Updated**: Permissions section to show:
  - **Managers**: Simple module checkboxes (Dashboard, Tasks, Users, Template, etc.)
  - **Other roles**: Existing granular permissions

### 2. Backend Changes

#### A. Updated Permissions Structure (`src/utils/permissions.ts`)
- **Added**: `MODULE_PERMISSIONS` constant matching frontend
- **Added**: `hasModuleAccess(userRole, userPermissions, module)` helper function

### 3. How It Works

#### For Managers:
1. **User Creation**: Admin selects which modules the manager can access
2. **Sidebar**: Only shows modules the manager has permissions for
3. **Navigation**: Manager can only access permitted modules
4. **Simple UI**: Just 8 module checkboxes instead of dozens of granular permissions

#### For Other Roles (Unchanged):
- **Admin/SuperAdmin**: Full access to everything
- **Inspector**: Predefined access as before
- **User Creation**: Still uses granular permissions for non-manager roles

### 4. Module Mapping

| Module | Sidebar Item | Route | Permission |
|--------|-------------|-------|------------|
| Dashboard | Dashboard | `/dashboard` | `access_dashboard` |
| Tasks | Tasks | `/tasks` | `access_tasks` |
| Users | Users | `/users` | `access_users` |
| Template | Templates | `/inspection` | `access_template` |
| Assets | Assets | `/assets` | `access_assets` |
| Questionnaires | Questionnaires | `/questionnaire` | `access_questionnaires` |
| Calendar | Calendar | `/calendar` | `access_calendar` |
| Profile | Profile | `/profile` | `access_profile` |

### 5. Benefits

1. **Simplified Management**: Easy to understand module-level access
2. **Flexible Control**: Admins can grant/restrict access per module
3. **Clean UI**: No more overwhelming permission lists for managers
4. **Backward Compatible**: Existing functionality for other roles unchanged
5. **Scalable**: Easy to add new modules in the future

### 6. Usage Instructions

#### Creating a Manager:
1. Go to Users → Create User
2. Select "Manager" role
3. Check the modules you want the manager to access
4. Save user

#### Manager Experience:
1. Manager logs in
2. Sidebar shows only permitted modules
3. Can navigate only to accessible modules
4. Clean, focused interface

### 7. Database Migration

No database migration required - existing users will continue to work. New manager users will use the module permission system.

## Technical Notes

- **Frontend**: Uses `hasModuleAccess()` for sidebar filtering
- **Backend**: Supports both granular and module permissions
- **Compatibility**: All existing permissions logic preserved
- **Performance**: Minimal impact, just additional permission checks

## Files Modified

### Frontend:
- `src/utils/permissions.js`
- `src/layouts/SideBar/index.jsx`
- `src/pages/users/components/UserForm.jsx`

### Backend:
- `src/utils/permissions.ts`

All changes are backward compatible and don't affect existing functionality. 