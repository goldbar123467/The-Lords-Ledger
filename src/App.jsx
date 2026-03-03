import { useReducer, useMemo, useState, useCallback } from "react";
import { gameReducer, initialState } from "./engine/gameReducer";
import seasonalEventsData from "./data/seasonalEvents";
import randomEventsData from "./data/randomEvents";

import TitleScreen from "./components/TitleScreen";
import Dashboard from "./components/Dashboard";
import TabBar from "./components/TabBar";
import EstateTab from "./components/EstateTab";
import TradeTab from "./components/TradeTab";
import MilitaryTab from "./components/MilitaryTab";
import PeopleTab from "./components/PeopleTab";
import Chronicle from "./components/Chronicle";
import EventCard from "./components/EventCard";
import ScribesNote from "./components/ScribesNote";
import ResolveScreen from "./components/ResolveScreen";
import GameOverScreen from "./components/GameOverScreen";
import VictoryScreen from "./components/VictoryScreen";

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
    activeTab,
    denarii,
    food,
    population,
  } = state;

  const payload = useMemo(
    () => ({ seasonalEvents, randomEvents }),
    []
  );

  // --- Action handlers ---

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

  function handleSetTab(tab) {
    dispatch({ type: "SET_TAB", payload: { tab } });
  }

  function handleBuild(buildingId) {
    dispatch({ type: "BUILD_BUILDING", payload: { buildingId } });
  }

  function handleDemolish(buildingIndex) {
    dispatch({ type: "DEMOLISH_BUILDING", payload: { buildingIndex } });
  }

  function handleSell(resource, quantity) {
    dispatch({ type: "SELL_RESOURCE", payload: { resource, quantity } });
  }

  function handleBuy(resource, quantity) {
    dispatch({ type: "BUY_RESOURCE", payload: { resource, quantity } });
  }

  function handleSetTaxRate(rate) {
    dispatch({ type: "SET_TAX_RATE", payload: { rate } });
  }

  const [isResolving, setIsResolving] = useState(false);

  const handleSimulateSeason = useCallback(() => {
    if (isResolving) return;
    setIsResolving(true);
    // Brief visual delay so the "Resolving..." state is visible
    requestAnimationFrame(() => {
      dispatch({ type: "SIMULATE_SEASON", payload });
      setIsResolving(false);
    });
  }, [isResolving, payload]);

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

  // --- Active Game (management + event phases) ---
  const isManagement = phase === "management";
  const isEventPhase =
    phase === "seasonal_action" ||
    phase === "seasonal_resolve" ||
    phase === "random_event" ||
    phase === "random_resolve";

  // During event phases, force chronicle tab to show events
  const displayTab = isEventPhase ? "chronicle" : activeTab;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f4e4c1" }}
    >
      {/* Scribe's Note overlay */}
      <ScribesNote text={scribesNote} onDismiss={handleDismissScribesNote} />

      {/* Sticky header: Dashboard + TabBar */}
      <div className="sticky top-0 z-40">
        <Dashboard
          meters={meters}
          meterDeltas={meterDeltas}
          activeMeterCount={activeMeterCount}
          denarii={denarii}
          food={food}
          population={population}
          season={season}
          year={year}
          turn={turn}
        />

        <TabBar
          activeTab={displayTab}
          onSetTab={handleSetTab}
          turn={turn}
          disabled={isEventPhase}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 py-4 pb-8">

        {/* --- ESTATE TAB --- */}
        {displayTab === "estate" && isManagement && (
          <EstateTab
            state={state}
            onBuild={handleBuild}
            onDemolish={handleDemolish}
          />
        )}

        {/* --- TRADE TAB --- */}
        {displayTab === "trade" && isManagement && (
          <TradeTab
            state={state}
            onSell={handleSell}
            onBuy={handleBuy}
          />
        )}

        {/* --- MILITARY TAB --- */}
        {displayTab === "military" && isManagement && (
          <MilitaryTab state={state} />
        )}

        {/* --- PEOPLE TAB --- */}
        {displayTab === "people" && isManagement && (
          <PeopleTab
            state={state}
            onSetTaxRate={handleSetTaxRate}
          />
        )}

        {/* --- CHRONICLE TAB (events + narrative log) --- */}
        {displayTab === "chronicle" && (
          <>
            {/* Event phases render inside the chronicle tab */}
            {phase === "seasonal_action" && currentEvent && (
              <EventCard
                event={currentEvent}
                onChoose={handleSeasonalChoice}
                phaseLabel="Seasonal Decision"
              />
            )}

            {phase === "seasonal_resolve" && (
              <ResolveScreen
                onContinue={handleContinueToRandom}
                buttonText="See What Happens Next"
              />
            )}

            {phase === "random_event" && currentRandomEvent && (
              <EventCard
                event={currentRandomEvent}
                onChoose={handleRandomChoice}
                phaseLabel="An Event Unfolds"
              />
            )}

            {phase === "random_resolve" && (
              <ResolveScreen
                onContinue={handleAdvanceTurn}
                buttonText={turn >= 28 ? "See Your Legacy" : "Continue"}
              />
            )}

            {/* Chronicle log (always visible in this tab) */}
            <Chronicle entries={chronicle} />
          </>
        )}
      </div>

      {/* Simulate Season button — visible during management phase */}
      {isManagement && (
        <div
          className="sticky bottom-0 w-full px-4 py-3 border-t-2 text-center z-30"
          style={{ backgroundColor: "#f0dca0", borderColor: "#c4a45a" }}
        >
          <button
            onClick={handleSimulateSeason}
            disabled={isResolving}
            className="px-10 py-3 rounded-md border-2 font-heading font-bold text-lg uppercase tracking-wider transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isResolving ? "#6b5210" : "#8b6914",
              borderColor: "#5a3a28",
              color: "#faf3e3",
              cursor: isResolving ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isResolving) e.currentTarget.style.backgroundColor = "#a07d1c";
            }}
            onMouseLeave={(e) => {
              if (!isResolving) e.currentTarget.style.backgroundColor = "#8b6914";
            }}
            aria-label={isResolving ? "Resolving season..." : "Simulate this season"}
          >
            {isResolving ? "Resolving..." : "Simulate Season"}
          </button>
          <p className="text-sm mt-1" style={{ color: "#5a3a28" }}>
            Resolve production, consumption, and events for {season ? season.charAt(0).toUpperCase() + season.slice(1) : ""}, Year {year}
          </p>
        </div>
      )}
    </div>
  );
}
