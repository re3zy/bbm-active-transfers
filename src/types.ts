export interface ConfigParseError {
  message: string;
  originalError: Error;
}

export interface PluginSettings {
  [key: string]: string | number | boolean | null;
}

export interface DataInfo {
  rowCount: number;
  columnName: string;
  hasData: boolean;
}

// Transfer Status Types
export enum TransferStatus {
  Initiated = 'Initiated',
  WarehouseReview = 'Warehouse Review',
  Confirmed = 'Confirmed',
  Shipped = 'Shipped',
  Completed = 'Completed'
}

// Transfer Record from CSV
export interface TransferRecord {
  transferId: string;
  requestDate: string;
  requestedBy: string;
  status: string;
  productKey: string | number;
  productName: string;
  skuNumber: string;
  excessStoreKey: string | number;
  excessStoreName: string;
  excessCity: string;
  excessState: string;
  excessDays: number;
  shortageStoreKey: string | number;
  shortageStoreName: string;
  shortageCity: string;
  shortageState: string;
  shortageDays: number;
  requestedQty: number;
  excessQty: number;
  confirmedQty: number | null;
  physicalCount: number | null;
}

// Helper function to map status string to timeline stage (0-4)
export function getStatusStage(status: string): number {
  const normalizedStatus = status.toLowerCase().trim();
  
  if (normalizedStatus.includes('initiated')) return 0;
  if (normalizedStatus.includes('warehouse') || normalizedStatus.includes('review')) return 1;
  if (normalizedStatus.includes('confirmed')) return 2;
  if (normalizedStatus.includes('shipped')) return 3;
  if (normalizedStatus.includes('completed') || normalizedStatus.includes('complete')) return 4;
  
  return 1; // Default to warehouse review
}

// Helper function to get status badge style
export function getStatusBadgeClass(status: string): string {
  const normalizedStatus = status.toLowerCase().trim();
  
  if (normalizedStatus.includes('warehouse') || normalizedStatus.includes('review')) {
    return 'status-warehouse-review';
  }
  if (normalizedStatus.includes('initiated')) {
    return 'status-initiated';
  }
  if (normalizedStatus.includes('confirmed')) {
    return 'status-confirmed';
  }
  if (normalizedStatus.includes('pending')) {
    return 'status-pending';
  }
  if (normalizedStatus.includes('shipped')) {
    return 'status-shipped';
  }
  if (normalizedStatus.includes('completed') || normalizedStatus.includes('complete')) {
    return 'status-completed';
  }
  
  return 'status-pending';
}