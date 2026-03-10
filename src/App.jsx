import { useReducer, useMemo, useState, useCallback } from "react";
import { gameReducer, initialState } from "./engine/gameReducer";
import seasonalEventsData from "./data/seasonalEvents";
import randomEventsData from "./data/randomEvents";
import { PERSPECTIVE_FLIPS } from "./data/perspectiveFlips";
import { computeFlipConsequences } from "./engine/flipEngine";

import TitleScreen from "./components/TitleScreen";
import Dashboard from "./components/Dashboard";
import TabBar from "./components/TabBar";
import EstateTab from "./components/EstateTab";
import TradeTab from "./components/TradeTab";
import MilitaryTab from "./components/MilitaryTab";
import PeopleTab from "./components/PeopleTab";
import MapTab from "./components/MapTab";
import Chronicle from "./components/Chronicle";
import EventCard from "./components/EventCard";
import ScribesNote from "./components/ScribesNote";
import ResolveScreen from "./components/ResolveScreen";
import GameOverScreen from "./components/GameOverScreen";
import VictoryScreen from "./components/VictoryScreen";
import FlipScreen from "./components/FlipScreen";
import SynergyToast from "./components/SynergyToast";
import TutorialHint from "./components/TutorialHint";


const seasonalEvents = Object.values(seasonalEventsData).flat();
const randomEvents = randomEventsData;

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const {
    phase,
    turn,
    season,
    year,
    chronicle,
    currentEvent,
    currentRandomEvent,
    scribesNote,
    gameOverReason,
    causeChain,
    activeTab,
    denarii,
    food,
    population,
    resourceDeltas,
    bankruptcyTurns,
    currentFlipId,
    currentFlipStats,
    currentDecisionIndex,
    currentFlipOutcome,
    flipConsequenceFlags,
    pendingSynergyNotifications,
    synergies,
  } = state;

  const payload = useMemo(
    () => ({ seasonalEvents, randomEvents }),
    []
  );

  // --- Action handlers ---

  function handleStart(difficulty) {
    dispatch({ type: "START_GAME", payload: { ...payload, difficulty } });
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

  function handleRecruit(count) {
    dispatch({ type: "RECRUIT_SOLDIERS", payload: { count } });
  }

  function handleDismiss(count) {
    dispatch({ type: "DISMISS_SOLDIERS", payload: { count } });
  }

  function handleUpgradeCastle() {
    dispatch({ type: "UPGRADE_CASTLE" });
  }

  function handleInstallDefense(upgradeId) {
    dispatch({ type: "INSTALL_DEFENSE", payload: { upgradeId } });
  }

  function handleDonate(amount) {
    dispatch({ type: "DONATE_TO_CHURCH", payload: { amount } });
  }

  // --- Flip handlers ---

  const [prevFlipStats, setPrevFlipStats] = useState(null);

  function handleDismissFlipIntro() {
    dispatch({ type: "DISMISS_FLIP_INTRO" });
  }

  function handleFlipOption(optionIndex) {
    setPrevFlipStats(currentFlipStats ? { ...currentFlipStats } : null);
    dispatch({ type: "SELECT_FLIP_OPTION", payload: { optionIndex } });
  }

  function handleContinueFlip() {
    dispatch({ type: "CONTINUE_FLIP" });
  }

  function handleDismissFlipSummary() {
    dispatch({ type: "DISMISS_FLIP_SUMMARY" });
  }

  function handleDismissSynergyNotification() {
    dispatch({ type: "DISMISS_SYNERGY_NOTIFICATION" });
  }

  const [isResolving, setIsResolving] = useState(false);

  const handleSimulateSeason = useCallback(() => {
    if (isResolving) return;
    setIsResolving(true);
    requestAnimationFrame(() => {
      dispatch({ type: "SIMULATE_SEASON", payload });
      setIsResolving(false);
    });
  }, [isResolving, payload]);

  // --- Computed values ---
  const isManagement = phase === "management";
  const isEventPhase =
    phase === "seasonal_action" ||
    phase === "seasonal_resolve" ||
    phase === "random_event" ||
    phase === "random_resolve";
  const isFlipPhase =
    phase === "flip_intro" ||
    phase === "flip_decision" ||
    phase === "flip_outcome" ||
    phase === "flip_summary";

  const flipData = currentFlipId ? PERSPECTIVE_FLIPS[currentFlipId] : null;

  const flipDisplayStats = useMemo(() => {
    if (!flipData || !currentFlipStats) return null;
    return Object.entries(flipData.characterStats).map(([key, config]) => ({
      key,
      label: config.label,
      icon: config.icon,
      color: config.color,
      value: currentFlipStats[key] ?? 0,
    }));
  }, [flipData, currentFlipStats]);

  const flipConsequencesPreview = useMemo(() => {
    if (!currentFlipId || phase !== "flip_summary") return null;
    return computeFlipConsequences(currentFlipId, flipConsequenceFlags);
  }, [currentFlipId, flipConsequenceFlags, phase]);

  const displayTab = isEventPhase ? "chronicle" : activeTab;

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
        state={state}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // --- Victory Screen ---
  if (phase === "victory") {
    return (
      <VictoryScreen
        state={state}
        onPlayAgain={handlePlayAgain}
        activatedSynergies={synergies?.activated ?? []}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0f0d0a" }}
    >
      {/* Scribe's Note overlay */}
      <ScribesNote text={scribesNote} onDismiss={handleDismissScribesNote} />

      {/* Sticky header: Dashboard + TabBar */}
      <div className="sticky top-0 z-40">
        <Dashboard
          denarii={denarii}
          food={food}
          population={population}
          garrison={state.garrison}
          season={season}
          year={year}
          turn={turn}
          resourceDeltas={resourceDeltas}
          bankruptcyTurns={bankruptcyTurns}
          flipMode={isFlipPhase}
          flipStats={flipDisplayStats}
        />

        {!isFlipPhase && (
          <TabBar
            activeTab={displayTab}
            onSetTab={handleSetTab}
            turn={turn}
            disabled={isEventPhase}
          />
        )}
      </div>

      {/* Tab content */}
      <div key={displayTab} className="flex-1 px-4 py-4 pb-8 tab-fade-in">

        {/* --- FLIP PHASES --- */}
        {isFlipPhase && flipData && (
          <FlipScreen
            phase={phase}
            flipData={flipData}
            currentFlipStats={currentFlipStats}
            currentDecisionIndex={currentDecisionIndex}
            currentFlipOutcome={currentFlipOutcome}
            flipOutcomeWasSuccess={state.flipOutcomeWasSuccess}
            consequences={flipConsequencesPreview}
            prevStats={prevFlipStats}
            onDismissIntro={handleDismissFlipIntro}
            onSelectOption={handleFlipOption}
            onContinue={handleContinueFlip}
            onDismissSummary={handleDismissFlipSummary}
          />
        )}

        {/* Tutorial hints for the active tab */}
        {!isFlipPhase && isManagement && (
          <TutorialHint tab={displayTab} turn={turn} />
        )}

        {/* --- ESTATE TAB --- */}
        {!isFlipPhase && displayTab === "estate" && isManagement && (
          <EstateTab
            state={state}
            onBuild={handleBuild}
            onDemolish={handleDemolish}
            activatedSynergies={synergies?.activated ?? []}
          />
        )}

        {/* --- MAP TAB --- */}
        {!isFlipPhase && displayTab === "map" && isManagement && (
          <MapTab state={state} />
        )}

        {/* --- TRADE TAB --- */}
        {!isFlipPhase && displayTab === "trade" && isManagement && (
          <TradeTab
            state={state}
            onSell={handleSell}
            onBuy={handleBuy}
          />
        )}

        {/* --- MILITARY TAB --- */}
        {!isFlipPhase && displayTab === "military" && isManagement && (
          <MilitaryTab
            state={state}
            onRecruit={handleRecruit}
            onDismiss={handleDismiss}
            onUpgradeCastle={handleUpgradeCastle}
            onInstallDefense={handleInstallDefense}
          />
        )}

        {/* --- PEOPLE TAB --- */}
        {!isFlipPhase && displayTab === "people" && isManagement && (
          <PeopleTab
            state={state}
            onSetTaxRate={handleSetTaxRate}
            onDonate={handleDonate}
          />
        )}

        {/* --- CHRONICLE TAB --- */}
        {!isFlipPhase && displayTab === "chronicle" && (
          <>
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

            <Chronicle entries={chronicle} />
          </>
        )}
      </div>

      {/* Synergy notification toast */}
      <SynergyToast
        notification={pendingSynergyNotifications?.[0] ?? null}
        onDismiss={handleDismissSynergyNotification}
      />

      {/* Simulate Season button */}
      {isManagement && !isFlipPhase && (
        <div
          className="sticky bottom-0 w-full px-4 py-3 text-center z-30"
          style={{ backgroundColor: "#0f0d0a", borderTop: "1px solid #8a7a3a" }}
        >
          <button
            onClick={handleSimulateSeason}
            disabled={isResolving}
            className={`px-10 py-3 rounded-md border-2 font-heading font-bold text-lg uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed${isResolving ? "" : " gold-glow"}`}
            style={{
              background: isResolving
                ? "linear-gradient(135deg, #5a1010 0%, #2a0505 50%, #5a1010 100%)"
                : "linear-gradient(135deg, #8b1a1a 0%, #4a0a0a 50%, #8b1a1a 100%)",
              border: "2px solid #c4a24a",
              color: "#e8c44a",
              fontFamily: "Cinzel Decorative, Cinzel, serif",
              letterSpacing: "3px",
              cursor: isResolving ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isResolving) {
                e.currentTarget.style.background = "linear-gradient(135deg, #c62828 0%, #6a1010 50%, #c62828 100%)";
                e.currentTarget.style.textShadow = "0 0 8px rgba(232, 196, 74, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isResolving) {
                e.currentTarget.style.background = "linear-gradient(135deg, #8b1a1a 0%, #4a0a0a 50%, #8b1a1a 100%)";
                e.currentTarget.style.textShadow = "none";
              }
            }}
            aria-label={isResolving ? "Resolving season..." : "Simulate this season"}
          >
            {isResolving ? "Resolving..." : "Simulate Season"}
          </button>
          <p className="text-sm mt-1 italic" style={{ color: "#a89070" }}>
            Resolve production, consumption, and events for {season ? season.charAt(0).toUpperCase() + season.slice(1) : ""}, Year {year}
          </p>
        </div>
      )}
    </div>
  );
}
