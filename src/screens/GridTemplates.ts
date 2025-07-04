/**
 * GridTemplates
 * -------------
 * Defines gridTemplateAreas for each game phase (Task Phase, Trick Phase).
 *
 * - TASK_PHASE_GRID: Used during task selection. Positions unclaimed tasks in center,
 *   player statuses around edges, and active player's hand at the bottom.
 *
 * - TRICK_PHASE_GRID: Used during trick play. Adds dedicated grid areas for each player's played card
 *   (e.g., "left-card", "top-middle-card") and a "last-trick" area for displaying previous trick results.
 *
 * These templates are passed into PlayerGridLayout to define the visual structure of each phase.
 */


export const TASK_PHASE_GRID = `
  ". top-left top-middle top-right info-button"
  ". center center center ."
  "left center center center right"
  ". active-comm . active-task active-task"
  "bottom-hand bottom-hand bottom-hand bottom-hand bottom-hand"
`;


export const TRICK_PHASE_GRID = `
  ". top-left top-middle top-right info-button"
  ". top-left-card top-middle-card top-right-card ."
  "left left-card center right-card right"
  ". active-comm active-card active-task active-task"
  "bottom-hand bottom-hand bottom-hand bottom-hand bottom-hand"
`;
