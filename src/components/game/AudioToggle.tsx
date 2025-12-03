import React from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Audio toggle component that provides a button to mute/unmute game sounds
 */
const AudioToggle: React.FC = () => {
  const isMuted = useAudio((state) => state.isMuted);
  const toggleMute = useAudio((state) => state.toggleMute);
  const backgroundMusic = useAudio((state) => state.backgroundMusic);

  // Handle clicking the audio toggle button
  const handleToggleAudio = () => {
    // Toggle the mute state first
    toggleMute();
    
    // Handle background music playback based on mute state
    if (backgroundMusic) {
      if (isMuted) {
        // If currently muted, unmuting will start playing the background music
        // Create a function to retry playing if it fails
        const attemptPlay = () => {
          backgroundMusic.play().catch(error => {
            console.log("Background music play prevented, retrying:", error);
            // Retry after a short delay
            setTimeout(attemptPlay, 500);
          });
        };
        
        // Start playing immediately
        attemptPlay();
        console.log("Attempting to play background music after unmuting");
      } else {
        // If currently unmuted, muting will pause the background music
        backgroundMusic.pause();
        console.log("Paused background music after muting");
      }
    }
  };

  return (
    <button
      onClick={handleToggleAudio}
      className="fixed top-4 right-4 z-50 bg-white bg-opacity-80 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
      aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
      title={isMuted ? "Unmute Sound" : "Mute Sound"}
    >
      {isMuted ? (
        <VolumeX size={24} className="text-gray-800" />
      ) : (
        <Volume2 size={24} className="text-gray-800" />
      )}
    </button>
  );
};

export default AudioToggle;