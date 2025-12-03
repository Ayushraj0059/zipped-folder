import React from 'react';

interface EscKeyReminderProps {
  isVisible: boolean;
}

/**
 * Component to display a reminder message about using ESC to show the cursor
 * Directly uses isVisible prop without internal state
 */
const EscKeyReminder: React.FC<EscKeyReminderProps> = ({ isVisible }) => {
  // If not visible, don't render anything
  if (!isVisible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInOut {
          0% { opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }
        .esc-reminder {
          animation: fadeInOut 2.5s forwards;
        }
      `}} />
      <div 
        className="fixed left-1/2 bottom-8 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 esc-reminder"
        style={{ 
          pointerEvents: 'none'
        }}
      >
        <p className="text-center font-medium">
          To show your cursor, Press ESC
        </p>
      </div>
    </>
  );
};

export default EscKeyReminder;