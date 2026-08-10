/**
 * Formats a number as Indonesian Rupiah using the standard "Rp 1.500.000" convention
 * called out in the design system (Inter Bold, "Rp" prefix, dot-grouped thousands).
 */
export function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
