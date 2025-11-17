import React from 'react';
import { TransferRecord, getStatusStage, getStatusBadgeClass } from '../types';
import { StatusTimeline } from './StatusTimeline';

interface TransferCardProps {
  transfer: TransferRecord;
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    let date: Date;
    
    // Check if it's a numeric timestamp
    const numericValue = Number(dateString);
    if (!isNaN(numericValue) && numericValue > 0) {
      // Determine if it's in seconds or milliseconds
      // Timestamps after year 2000 in seconds are > 946684800
      // Timestamps before year 3000 in seconds are < 32503680000
      if (numericValue < 10000000000) {
        // Likely in seconds (before year 2286 in seconds)
        date = new Date(numericValue * 1000);
      } else {
        // Already in milliseconds
        date = new Date(numericValue);
      }
    } else {
      // Try parsing as a date string (e.g., "2025-11-16")
      date = new Date(dateString);
    }
    
    // Check if the date is valid and reasonable (between 1970 and 2100)
    const year = date.getFullYear();
    if (isNaN(date.getTime()) || year < 1970 || year > 2100) {
      return dateString;
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateString;
  }
};

const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return num.toString();
};

const formatDays = (days: number): string => {
  if (!days || isNaN(days)) return '0.0';
  return days.toFixed(1);
};

export const TransferCard: React.FC<TransferCardProps> = ({ transfer }) => {
  const currentStage = getStatusStage(transfer.status);
  const statusBadgeClass = getStatusBadgeClass(transfer.status);
  const isCritical = transfer.shortageDays < 5; // Critical if shortage store has less than 5 days supply

  return (
    <div className={`transfer-status-card ${isCritical ? 'critical' : ''}`}>
      {/* Header Row */}
      <div className="transfer-header-row">
        <div className="transfer-info">
          <div className="transfer-id">{transfer.transferId}</div>
          <div className="transfer-product">{transfer.productName}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            SKU: {transfer.skuNumber} • Requested: {formatDate(transfer.requestDate)}
            {transfer.requestedBy && ` by ${transfer.requestedBy}`}
          </div>
        </div>
        <div className={`transfer-status-badge ${statusBadgeClass}`}>
          {transfer.status}
        </div>
      </div>

      {/* Status Timeline */}
      <StatusTimeline currentStage={currentStage} />

      {/* Transfer Details */}
      <div className="transfer-details-grid">
        <div className="detail-section">
          <div className="detail-label">📦 From (Source)</div>
          <div className="detail-value">{transfer.excessStoreName}</div>
          <div className="detail-subvalue">
            {transfer.excessCity}, {transfer.excessState}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px' }}>
            System: <strong>{formatNumber(transfer.excessQty)} units</strong> ({formatDays(transfer.excessDays)} days supply)
          </div>
        </div>
        <div className="detail-section">
          <div className="detail-label">🎯 To (Destination)</div>
          <div className="detail-value">{transfer.shortageStoreName || 'N/A'}</div>
          <div className="detail-subvalue">
            {transfer.shortageCity || 'N/A'}, {transfer.shortageState || 'N/A'}
            {' (N/A)'}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px' }}>
            Needs: <strong style={{ color: isCritical ? '#dc2626' : 'inherit' }}>
              {formatNumber(transfer.requestedQty)} units
            </strong> ({formatDays(transfer.shortageDays)} days supply {isCritical ? '⚠️' : ''})
          </div>
        </div>
      </div>

      {/* Quantity Summary */}
      <div className="quantity-comparison">
        <div className="qty-item">
          <div className="qty-label">Requested</div>
          <div className="qty-value qty-requested">{formatNumber(transfer.requestedQty)}</div>
          <div className="qty-label">units</div>
        </div>
        <div className="qty-item">
          <div className="qty-label">System Available</div>
          <div className="qty-value qty-system">{formatNumber(transfer.excessQty)}</div>
          <div className="qty-label">units</div>
        </div>
        <div className="qty-item">
          <div className="qty-label">Confirmed</div>
          <div className="qty-value" style={{ color: transfer.confirmedQty ? '#10b981' : '#9ca3af' }}>
            {formatNumber(transfer.confirmedQty)}
          </div>
          <div className="qty-label">{transfer.confirmedQty ? 'units ✓' : 'pending'}</div>
        </div>
      </div>

      {/* Confirmation Details (if confirmed) */}
      {transfer.confirmedQty && transfer.physicalCount && currentStage >= 2 && (
        <div style={{ 
          background: '#f9fafb', 
          padding: '12px', 
          borderRadius: '8px', 
          fontSize: '13px',
          marginTop: '16px'
        }}>
          <strong>Physical Count:</strong> {formatNumber(transfer.physicalCount)} units<br />
          <strong>Confirmed:</strong> {formatDate(transfer.requestDate)}
        </div>
      )}
    </div>
  );
};

