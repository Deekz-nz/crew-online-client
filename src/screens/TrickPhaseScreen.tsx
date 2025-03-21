import PlayerGridLayout from "./PlayerGridLayout";
import { TRICK_PHASE_GRID } from "./GridTemplates";

export default function TrickPhaseScreen() {
  return (
    <PlayerGridLayout gridTemplateAreas={TRICK_PHASE_GRID}>
      {/* TODO: Add played cards in front of each player, last trick result */}
      <></>
    </PlayerGridLayout>
  );
}
