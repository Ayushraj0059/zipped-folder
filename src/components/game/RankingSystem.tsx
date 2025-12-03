import { useEffect, useState } from "react";
import { useAIBallsStore } from "./AIBall";
import { useGame } from "@/lib/stores/useGame";
import { useDifficulty } from "@/lib/stores/useDifficulty";

interface RankEntry {
  id: number | null; // null for player
  isPlayer: boolean;
  powerUpsCollected: number;
  color: string;
}

/**
 * Component to display the current ranking and powerups count
 * Shows the top 3 collectors in the game
 * Only displays when game is in playing phase and difficulty is selected
 */
const RankingSystem = () => {
  const [rankings, setRankings] = useState<RankEntry[]>([]);
  const [powerupCount, setPowerupCount] = useState(0);
  
  // Get AI balls and player data from store
  const aiBalls = useAIBallsStore(state => state.aiBalls);
  const playerPowerUpsCollected = useAIBallsStore(state => state.playerPowerUpsCollected);
  const getTotalPowerupsCollected = useAIBallsStore(state => state.getTotalPowerupsCollected);
  
  // Get game phase and difficulty selection status
  const gamePhase = useGame(state => state.phase);
  const hasSelectedLevel = useDifficulty(state => state.hasSelectedLevel);
  
  // Update rankings every frame
  useEffect(() => {
    // Only run the update logic if the game is in playing phase and level is selected
    if (gamePhase !== "playing" || !hasSelectedLevel) return;
    
    const updateRankings = () => {
      // Create list of all entities (player + AI balls)
      const allEntities: RankEntry[] = [
        // Add player
        {
          id: null,
          isPlayer: true,
          powerUpsCollected: playerPowerUpsCollected,
          color: "#1e88e5" // Blue color for player
        },
        // Add all AI balls
        ...aiBalls.map(ball => ({
          id: ball.id,
          isPlayer: false,
          powerUpsCollected: ball.powerUpsCollected,
          color: ball.color
        }))
      ];
      
      // Sort by powerups collected (descending)
      const sortedEntities = allEntities.sort((a, b) => 
        b.powerUpsCollected - a.powerUpsCollected
      );
      
      // Take only top 3
      const topThree = sortedEntities.slice(0, 3);
      
      // Update rankings
      setRankings(topThree);
      
      // Update powerup count
      setPowerupCount(getTotalPowerupsCollected());
    };
    
    // Run initially
    updateRankings();
    
    // Set interval to update every 500ms
    const intervalId = setInterval(updateRankings, 500);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [aiBalls, playerPowerUpsCollected, getTotalPowerupsCollected, gamePhase, hasSelectedLevel]);
  
  // Don't render anything if game is not in playing phase or no difficulty is selected
  if (gamePhase !== "playing" || !hasSelectedLevel) {
    return null;
  }
  
  return (
    <div id="powerupPanel" style={{ padding: '1vh 1vw' }}>
      <div className="font-bold mb-1">
        Powerups Count: <span className="text-yellow-400">{Math.min(powerupCount, 12)}/12</span>
      </div>
      
      {/* Rankings */}
      <div className="space-y-1">
        {rankings.map((entry, index) => (
          <div key={entry.isPlayer ? 'player' : `ai-${entry.id}`} className="flex items-center">
            <div className="w-8 text-right font-bold">#{index + 1}</div>
            <div 
              className="w-3 h-3 mx-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex-1">
              {entry.isPlayer ? "You" : `AI Ball ${entry.id}`}
            </div>
            <div className="w-8 text-right font-bold text-yellow-400">
              {entry.powerUpsCollected}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingSystem;