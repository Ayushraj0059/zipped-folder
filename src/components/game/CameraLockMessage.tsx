import React from 'react';

interface CameraLockMessageProps {
  isVisible: boolean;
}

/**
 * Component to display a notification message when the camera control is disabled
 */
const CameraLockMessage: React.FC<CameraLockMessageProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed left-1/2 bottom-8 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0, pointerEvents: 'none' }}
    >
      <p className="text-center font-medium">
        Camera control disabled - Click anywhere to Enable and lock the cursor
      </p>
    </div>
  );
};

export default CameraLockMessage;