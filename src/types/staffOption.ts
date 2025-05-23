
/**
 * Interface for staff options used in dropdown menus.
 * Specifically designed for staff liaison selection in client forms.
 */
export interface StaffOption {
  id: string;
  full_name: string; // Note: snake_case as this is coming directly from the database
}
