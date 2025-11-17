import React from 'react';

interface StatusTimelineProps {
  currentStage: number; // 0-4: Initiated, Warehouse Review, Confirmed, Shipped, Completed
}

const STAGES = [
  { label: 'Initiated', icon: '✓' },
  { label: 'Warehouse Review', icon: '📦' },
  { label: 'Confirmed', icon: '📋' },
  { label: 'Shipped', icon: '🚚' },
  { label: 'Completed', icon: '✅' }
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStage }) => {
  return (
    <div className="status-timeline">
      {STAGES.map((stage, index) => {
        const isCompleted = index < currentStage;
        const isActive = index === currentStage;
        const isPending = index > currentStage;
        
        return (
          <div key={stage.label} className="status-step">
            <div 
              className={`status-dot ${
                isCompleted ? 'completed' : 
                isActive ? 'active' : 
                'pending'
              }`}
            >
              {isCompleted ? '✓' : stage.icon}
            </div>
            <div 
              className={`status-label ${
                isCompleted ? 'completed' : 
                isActive ? 'active' : 
                ''
              }`}
            >
              {stage.label}
            </div>
            {index < STAGES.length - 1 && (
              <div className={`status-line ${isCompleted ? 'completed' : ''}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

