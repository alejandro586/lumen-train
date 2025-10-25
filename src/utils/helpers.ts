// Utility function to check if a value is numeric
export function isNumeric(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return !isNaN(parseFloat(value)) && isFinite(value);
}
