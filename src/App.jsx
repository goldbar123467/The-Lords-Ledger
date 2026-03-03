import { useReducer, useMemo } from "react";
import { gameReducer, initialState } from "./engine/gameReducer";
import seasonalEventsData from "./data/seasonalEvents";
import randomEventsData from "./data/randomEvents";

import TitleScreen from "./components/TitleScreen";
import ResourceBar from "./components/ResourceBar";
import SeasonHeader from "./components/SeasonHeader";
import EventCard from "./components/EventCard";
import Chronicle from "./components/Chronicle";
import ScribesNote from "./components/ScribesNote";
import ResolveScreen from "./components/ResolveScreen";
import GameOverScreen from "./components/GameOverScreen";
import VictoryScreen from "./components/VictoryScreen";

// Flatten the seasonal events object { spring: [...], summer: [...], ... }
// into a single array since the engine expects a flat array.
const seasonalEvents = Object.values(seasonalEventsData).flat();
const randomEvents = randomEventsData;

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const {
    phase,
    turn,
    season,
    year,
    meters,
    meterDeltas,
    chronicle,
    currentEvent,
    currentRandomEvent,
    scribesNote,
    activeMeterCount,
    gameOverReason,
    causeChain,
  } = state;

  const payload = useMemo(
    () => ({ seasonalEvents, randomEvents }),
    []
  );

  function handleStart() {
    dispatch({ type: "START_GAME", payload });
  }

  function handleSeasonalChoice(optionIndex) {
    dispatch({ type: "SELECT_SEASONAL_ACTION", payload: { optionIndex } });
  }

  function handleContinueToRandom() {
    dispatch({ type: "CONTINUE_TO_RANDOM", payload });
  }

  function handleRandomChoice(optionIndex) {
    dispatch({ type: "SELECT_RANDOM_RESPONSE", payload: { optionIndex } });
  }

  function handleAdvanceTurn() {
    dispatch({ type: "ADVANCE_TURN", payload });
  }

  function handleDismissScribesNote() {
    dispatch({ type: "DISMISS_SCRIBES_NOTE" });
  }

  function handlePlayAgain() {
    dispatch({ type: "PLAY_AGAIN", payload });
  }

  // --- Title Screen ---
  if (phase === "title") {
    return <TitleScreen onStart={handleStart} />;
  }

  // --- Game Over Screen ---
  if (phase === "game_over") {
    return (
      <GameOverScreen
        gameOverReason={gameOverReason}
        causeChain={causeChain}
        meters={meters}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // --- Victory Screen ---
  if (phase === "victory") {
    return (
      <VictoryScreen
        meters={meters}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // --- Active Game ---
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f4e4c1" }}
    >
      {/* Scribe's Note overlay */}
      <ScribesNote text={scribesNote} onDismiss={handleDismissScribesNote} />

      {/* Resource meters */}
      <ResourceBar
        meters={meters}
        meterDeltas={meterDeltas}
        activeMeterCount={activeMeterCount}
      />

      {/* Season header */}
      <SeasonHeader season={season} year={year} turn={turn} />

      {/* Main content */}
      <div className="flex-1 px-4 py-4 pb-8">
        {/* Seasonal Action Phase */}
        {phase === "seasonal_action" && currentEvent && (
          <EventCard
            event={currentEvent}
            onChoose={handleSeasonalChoice}
            phaseLabel="Seasonal Decision"
          />
        )}

        {/* Seasonal Resolve Phase */}
        {phase === "seasonal_resolve" && (
          <ResolveScreen
            onContinue={handleContinueToRandom}
            buttonText="See What Happens Next"
          />
        )}

        {/* Random Event Phase */}
        {phase === "random_event" && currentRandomEvent && (
          <EventCard
            event={currentRandomEvent}
            onChoose={handleRandomChoice}
            phaseLabel="An Event Unfolds"
          />
        )}

        {/* Random Resolve Phase */}
        {phase === "random_resolve" && (
          <ResolveScreen
            onContinue={handleAdvanceTurn}
            buttonText={turn >= 28 ? "See Your Legacy" : "Next Season"}
          />
        )}

        {/* Chronicle */}
        <Chronicle entries={chronicle} />
      </div>
    </div>
  );
}
