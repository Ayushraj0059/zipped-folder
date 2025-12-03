import React, { useState, useEffect } from "react";

interface HelpTutorialPopupProps {
  onClose: () => void;
  backgroundStyle?: React.CSSProperties;
}

/**
 * Help/Tutorial popup component that displays slide-based tutorial images
 * Shows 5 tutorial slides with navigation controls
 */
const HelpTutorialPopup: React.FC<HelpTutorialPopupProps> = ({ 
  onClose, 
  backgroundStyle = {} 
}) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 5;

  // Tutorial slide images
  const slideImages = [
    "/images/tutorial-slide-1.jpg", // Difficulty selection
    "/images/tutorial-slide-2.jpg", // PC controls
    "/images/tutorial-slide-3.jpg", // Powerup details
    "/images/tutorial-slide-4.jpg", // Speed booster
    "/images/tutorial-slide-5.jpg"  // Settings menu
  ];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSlideClick = (slideNumber: number) => {
    setCurrentSlide(slideNumber);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          backdropFilter: "blur(10px)",
          ...backgroundStyle
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">How to Play - Tutorial</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200 w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Slide content */}
        <div className="relative">
          <img
            src={slideImages[currentSlide - 1]}
            alt={`Tutorial slide ${currentSlide}`}
            className="w-full h-auto max-h-[60vh] object-contain bg-black"
            style={{ minHeight: '400px' }}
          />
          
          {/* Slide indicator dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handleSlideClick(index + 1)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentSlide === index + 1
                    ? 'bg-blue-500 scale-125'
                    : 'bg-gray-400 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentSlide === 1}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              currentSlide === 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }`}
          >
            ← Previous
          </button>
          
          <div className="text-white font-medium">
            {currentSlide} / {totalSlides}
          </div>
          
          <button
            onClick={handleNext}
            disabled={currentSlide === totalSlides}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              currentSlide === totalSlides
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }`}
          >
            Next →
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-6 pb-4 text-sm text-gray-400 text-center">
          Use ← → arrow keys to navigate • Press ESC to close
        </div>
      </div>
    </div>
  );
};

export default HelpTutorialPopup;