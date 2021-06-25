/*
  This is an implementation of "Algorithm 2" from John Brzustowski's 1992 paper
  "Can You Win At Tetris?" <https://open.library.ubc.ca/media/download/pdf/831/1.0079748/1>.

  """
    1. Send left kink and display left kink until a cycle is detected.
    2. Send one left kink and display right kink.
    3. Send right kink and display right kink until a cycle is detected.
    4. Send one right kink and display left kink.
    5. Go to step 1.
  """

  Here "left kink" means an S piece and "right kink" is a Z piece. Note: HATETRIS has no
  "display" (preview) piece, but nevertheless this behaviour is preserved in the algorithm below.

  On the topic of of detecting a cycle, the paper suggests creating a list of all of
  the states visited and adds,

  """
    Each time you enter step 1 or 2, the machine empties the list.
  """

  We believe this is a typographical error and Brzustowski intended to write "steps 1 or 3".
*/

import type { CoreState, EnemyAi } from '../components/Game/Game.jsx'

type Step = 1 | 2
type Piece = 'S' | 'Z'

type BrzAiState = {
  step: Step,
  queue: Piece[] // includes the piece currently in the well and all previewed pieces
  seenWells: number[][]
}

const NUM_PREVIEW_PIECES = 2

export const brzAi: EnemyAi = (
  currentCoreState: CoreState,
  currentAiState: undefined | BrzAiState,
  getNextCoreStates: (
    coreState: CoreState,
    pieceId: string
  ) => CoreState[]
): [string, BrzAiState] => {
  if (currentAiState === undefined) {
    currentAiState = {
      step: 1,
      queue: Array(1 + NUM_PREVIEW_PIECES).fill('S'),
      seenWells: []
    }
  }

  const last = currentAiState.queue[currentAiState.queue.length - 1]

  // By default just send the same piece as last time and stay in this state
  const nextAiState: BrzAiState = {
    step: currentAiState.step,
    queue: [...currentAiState.queue.slice(1), last],
    seenWells: [
      ...currentAiState.seenWells,
      currentCoreState.well
    ]
  }

  if (currentAiState.step === 1) {
    // Step 1: waiting for a cycle
    const cycleDetected = currentAiState.seenWells.some(seenWell =>
      seenWell.every((row: number, y) =>
        row === currentCoreState.well[y]
      )
    )

    if (cycleDetected) {
      // Start sending the opposite piece
      nextAiState.step = 2
      nextAiState.queue[nextAiState.queue.length - 1] = last === 'S' ? 'Z' : 'S'
    }
  } else {
    // Step 2: waiting for the opposite piece to make its way to the front
    if (nextAiState.queue[0] === last) {
      // Go back to waiting for a cycle
      nextAiState.step = 1
      nextAiState.seenWells = []
    }
  }

  return [nextAiState.queue[0], nextAiState]
}
