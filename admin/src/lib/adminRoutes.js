/** Hidden staff routes - not linked from the public store */
export const ADMIN_LOGIN_PATH = '/station/night-desk';
export const ADMIN_BASE_PATH = '/station/night-desk/console';

export function isAdminPath(pathname) {
  return pathname.startsWith('/station/night-desk');
}

export const adminPath = (segment = '') =>
  segment ? `${ADMIN_BASE_PATH}/${segment.replace(/^\//, '')}` : ADMIN_BASE_PATH;

