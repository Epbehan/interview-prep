import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

/**
 * A single "frame" of the visualization.
 *
 * We precompute a list of these frames so we can:
 * - Animate forward (play)
 * - Pause at any moment
 * - Step backward/forward (because we have snapshots)
 *
 * This is much easier than trying to run merge sort “live” and reverse it.
 */
type MergeStep = {
  /** The array as it looks at this point in time */
  arraySnapshot: number[];

  /**
   * Indices involved in the current operation.
   * We use this to highlight bars so you can see where work is happening.
   *
   * In this implementation we track:
   * - writeIndex (where we are writing into the merged array)
   * - the source index we copied from (leftIndex or rightIndex)
   */
  activeIndices: number[];

  /**
   * The subarray window being merged: [windowStart, windowEnd)
   * Split into left:  [windowStart, windowMid)
   * and right:        [windowMid, windowEnd)
   *
   * Displayed as a label so you can connect the visualization to merge sort theory.
   */
  windowStart: number;
  windowMid: number;
  windowEnd: number;
};

/**
 * Creates an array of random integers.
 * Used to generate new input data for the visualization.
 */
function generateRandomArray(arrayLength: number, maxValue: number): number[] {
  const randomValues: number[] = [];
  for (let index = 0; index < arrayLength; index += 1) {
    randomValues.push(Math.floor(Math.random() * maxValue));
  }
  return randomValues;
}

/**
 * Ensures numeric input stays in a safe range.
 * This prevents UI values like negative length or “0ms delay” causing odd behavior.
 */
function clampInteger(
  value: number,
  minValue: number,
  maxValue: number
): number {
  return Math.max(minValue, Math.min(maxValue, Math.floor(value)));
}

/**
 * buildMergeSortSteps
 * -------------------
 * Precomputes every step ("frame") needed to animate merge sort.
 *
 * Why precompute steps instead of sorting directly?
 * - Sorting normally returns only the final array.
 * - For visualization, we need intermediate states.
 * - By recording snapshots after each write, we can animate and step backwards.
 *
 * Why bottom-up merge sort (iterative) instead of recursive?
 * - Recursive merge sort is totally valid, but stepping through recursion is trickier.
 * - Bottom-up merge sort performs merges in predictable passes:
 *     width = 1, 2, 4, 8...
 *   and each pass merges adjacent sorted blocks of that width.
 * - This structure makes it straightforward to record “what changed” after each write.
 */
function buildMergeSortSteps(values: number[]): MergeStep[] {
  const steps: MergeStep[] = [];

  /**
   * We keep two arrays and swap roles each pass:
   * - sourceArray: read from (already sorted blocks for this pass)
   * - targetArray: write into (results of merges)
   *
   * This is a common merge sort optimization technique: avoid constantly creating new arrays.
   */
  const workingArray: number[] = values.slice();
  const auxiliaryArray: number[] = values.slice();

  /**
   * Records a single animation frame.
   *
   * IMPORTANT: we always clone arrays here (slice()) so each step is immutable.
   * If we stored references, later writes would mutate older steps and the animation would break.
   */
  const recordStep = (
    sourceArray: number[],
    activeIndices: number[],
    windowStart: number,
    windowMid: number,
    windowEnd: number
  ) => {
    steps.push({
      arraySnapshot: sourceArray.slice(),
      activeIndices: activeIndices.slice(),
      windowStart,
      windowMid,
      windowEnd,
    });
  };

  /**
   * Merges two sorted halves within sourceArray into targetArray.
   *
   * The halves are:
   * - left:  [leftStart, mid)
   * - right: [mid, rightEnd)
   *
   * This is the “core” merge operation you’d implement in classic merge sort.
   * We record a step after EACH write into targetArray so you can see the merge unfold.
   */
  const mergeIntoTarget = (
    sourceArray: number[],
    targetArray: number[],
    leftStart: number,
    mid: number,
    rightEnd: number
  ) => {
    let leftIndex = leftStart;
    let rightIndex = mid;

    /**
     * We fill targetArray from leftStart up to rightEnd.
     * At each writeIndex, we choose the smaller of the two “front” items:
     * - sourceArray[leftIndex]
     * - sourceArray[rightIndex]
     *
     * If one half is exhausted, we take from the other half.
     */
    for (let writeIndex = leftStart; writeIndex < rightEnd; writeIndex += 1) {
      const leftIsExhausted = leftIndex >= mid;
      const rightIsExhausted = rightIndex >= rightEnd;

      /**
       * shouldTakeRight is true if:
       * - right still has items AND
       * - left is exhausted OR right's current item is smaller than left's current item
       *
       * This preserves sorted order in the merged output.
       */
      const shouldTakeRight =
        !rightIsExhausted &&
        (leftIsExhausted || sourceArray[rightIndex] < sourceArray[leftIndex]);

      if (shouldTakeRight) {
        targetArray[writeIndex] = sourceArray[rightIndex];

        // Highlight: writeIndex (where we wrote) + rightIndex (where we read from)
        recordStep(
          targetArray,
          [writeIndex, rightIndex],
          leftStart,
          mid,
          rightEnd
        );

        rightIndex += 1;
      } else {
        targetArray[writeIndex] = sourceArray[leftIndex];

        // Highlight: writeIndex (where we wrote) + leftIndex (where we read from)
        recordStep(
          targetArray,
          [writeIndex, leftIndex],
          leftStart,
          mid,
          rightEnd
        );

        leftIndex += 1;
      }
    }
  };

  /**
   * Record the initial state so the visualization has a starting frame.
   * This lets “Reset” return to something meaningful.
   */
  recordStep(workingArray, [], 0, 0, workingArray.length);

  /**
   * Bottom-up merge sort
   * --------------------
   * Start with width = 1 (each element is a sorted block of size 1).
   * Then merge adjacent blocks into size 2, then 4, 8, ...
   *
   * After each full pass, the array consists of sorted blocks of size `width`.
   */
  let width = 1;
  let sourceArray = workingArray;
  let targetArray = auxiliaryArray;

  while (width < values.length) {
    /**
     * Merge blocks in pairs:
     * leftStart jumps by 2*width each time because we merge:
     *   [leftStart, leftStart + width) with [leftStart + width, leftStart + 2*width)
     */
    for (let leftStart = 0; leftStart < values.length; leftStart += 2 * width) {
      const mid = Math.min(leftStart + width, values.length);
      const rightEnd = Math.min(leftStart + 2 * width, values.length);

      /**
       * If there is no right block (we're at the end with an odd remainder),
       * we simply copy the leftover items into the target.
       * This preserves them for the next pass.
       */
      if (mid >= rightEnd) {
        for (let index = leftStart; index < rightEnd; index += 1) {
          targetArray[index] = sourceArray[index];

          // Record each copy so the animation still reflects “work being done”.
          recordStep(targetArray, [index], leftStart, mid, rightEnd);
        }
        continue;
      }

      // Otherwise, merge two sorted blocks into the target.
      mergeIntoTarget(sourceArray, targetArray, leftStart, mid, rightEnd);
    }

    /**
     * Swap roles:
     * - The target now contains the merged results for this pass
     * - Next pass will read from that result and write into the other array
     */
    const previousSourceArray = sourceArray;
    sourceArray = targetArray;
    targetArray = previousSourceArray;

    // Double the size of sorted blocks for the next pass.
    width *= 2;
  }

  /**
   * Ensure the final snapshot reflects the final sorted array.
   * (Sometimes the last recorded merge write is enough, but this guarantees it.)
   */
  recordStep(sourceArray, [], 0, Math.floor(values.length / 2), values.length);

  return steps;
}

/**
 * Human-readable label for the merge window.
 * Helps connect the visualization back to the concept of merging two halves.
 */
function formatWindowLabel(step: MergeStep): string {
  if (step.windowEnd <= step.windowStart) return "";
  return `Merging [${step.windowStart}, ${step.windowMid}) + [${step.windowMid}, ${step.windowEnd})`;
}

export default function MergeSortVisualizer() {
  // User-controlled settings
  const [arrayLength, setArrayLength] = useState<number>(32);
  const [maxValue, setMaxValue] = useState<number>(100);
  const [animationDelayMs, setAnimationDelayMs] = useState<number>(30);

  /**
   * The actual base input array (what we're sorting).
   * Changing this regenerates steps.
   */
  const [values, setValues] = useState<number[]>(() =>
    generateRandomArray(32, 100)
  );

  /**
   * Precomputed frames of the algorithm.
   * We animate by moving forward through this array.
   */
  const [steps, setSteps] = useState<MergeStep[]>(() =>
    buildMergeSortSteps(values)
  );

  // Which frame we are currently showing
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Whether the interval timer is running
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  /**
   * Store the interval id so we can always clear it on:
   * - pause
   * - speed change
   * - unmount
   *
   * Using a ref avoids interval ids getting lost between renders.
   */
  const animationIntervalIdRef = useRef<number | null>(null);

  // Safe guard: if currentStepIndex is out of range, clamp to last step.
  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];

  /**
   * Scaling the bars:
   * We compute the max value so we can normalize all bar heights
   * to a percentage of the container height.
   */
  const maxBarValue = useMemo(() => {
    const maximum = Math.max(...(currentStep?.arraySnapshot ?? values), 1);
    return maximum;
  }, [currentStep, values]);

  /**
   * Generate a new random array and rebuild all animation steps.
   * We also stop the animation and reset to frame 0.
   */
  const randomizeValues = () => {
    const nextValues = generateRandomArray(arrayLength, maxValue);
    setValues(nextValues);

    const nextSteps = buildMergeSortSteps(nextValues);
    setSteps(nextSteps);

    setCurrentStepIndex(0);
    setIsAnimating(false);
  };

  // Controls for moving around in time
  const resetToStart = () => {
    setCurrentStepIndex(0);
    setIsAnimating(false);
  };

  const jumpToEnd = () => {
    setCurrentStepIndex(steps.length - 1);
    setIsAnimating(false);
  };

  const startAnimation = () => {
    if (steps.length <= 1) return;
    setIsAnimating(true);
  };

  const pauseAnimation = () => {
    setIsAnimating(false);
  };

  const stepForwardOnce = () => {
    setIsAnimating(false);
    setCurrentStepIndex((previousIndex) =>
      Math.min(previousIndex + 1, steps.length - 1)
    );
  };

  const stepBackwardOnce = () => {
    setIsAnimating(false);
    setCurrentStepIndex((previousIndex) => Math.max(previousIndex - 1, 0));
  };

  /**
   * Animation effect:
   * - When isAnimating is true, create an interval that advances currentStepIndex.
   * - When paused or unmounted, clear the interval.
   *
   * cleanupStep prevents multiple intervals from stacking.
   */
  useEffect(() => {
    const cleanupStep = () => {
      if (animationIntervalIdRef.current !== null) {
        window.clearInterval(animationIntervalIdRef.current);
        animationIntervalIdRef.current = null;
      }
    };

    cleanupStep();

    if (!isAnimating) {
      return cleanupStep;
    }

    animationIntervalIdRef.current = window.setInterval(
      () => {
        setCurrentStepIndex((previousIndex) => {
          const nextIndex = previousIndex + 1;

          // Stop automatically at the end (so the UI doesn’t loop forever)
          if (nextIndex >= steps.length) {
            window.setTimeout(() => setIsAnimating(false), 0);
            return steps.length - 1;
          }

          return nextIndex;
        });
      },
      Math.max(1, animationDelayMs)
    );

    return cleanupStep;
  }, [isAnimating, animationDelayMs, steps.length]);

  /**
   * One-time clamp of initial values.
   * (If you later want to clamp on every change, you can clamp in the onChange handlers instead.)
   */
  useEffect(() => {
    setArrayLength((previous) => clampInteger(previous, 2, 160));
    setMaxValue((previous) => clampInteger(previous, 5, 1000));
    setAnimationDelayMs((previous) => clampInteger(previous, 1, 500));
  }, []);

  // Data for rendering
  const displayedArray = currentStep?.arraySnapshot ?? values;
  const activeSet = new Set(currentStep?.activeIndices ?? []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Merge Sort Visualizer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Randomize an array, then watch merge sort build the sorted result
            step-by-step.
          </Typography>
        </Stack>

        {/* Controls panel: settings + playback controls */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Array length"
                type="number"
                value={arrayLength}
                onChange={(event) =>
                  setArrayLength(
                    clampInteger(Number(event.target.value), 2, 160)
                  )
                }
                inputProps={{ min: 2, max: 160 }}
                fullWidth
              />

              <TextField
                label="Max value"
                type="number"
                value={maxValue}
                onChange={(event) =>
                  setMaxValue(clampInteger(Number(event.target.value), 5, 1000))
                }
                inputProps={{ min: 5, max: 1000 }}
                fullWidth
              />

              <TextField
                label="Speed (ms per step)"
                type="number"
                value={animationDelayMs}
                onChange={(event) =>
                  setAnimationDelayMs(
                    clampInteger(Number(event.target.value), 1, 500)
                  )
                }
                inputProps={{ min: 1, max: 500 }}
                fullWidth
              />
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              useFlexGap
              flexWrap="wrap"
            >
              <Button variant="contained" onClick={randomizeValues}>
                Randomize
              </Button>

              {!isAnimating ? (
                <Button variant="outlined" onClick={startAnimation}>
                  Play
                </Button>
              ) : (
                <Button variant="outlined" onClick={pauseAnimation}>
                  Pause
                </Button>
              )}

              <Button variant="text" onClick={resetToStart}>
                Reset
              </Button>
              <Button variant="text" onClick={jumpToEnd}>
                End
              </Button>

              <Divider
                flexItem
                orientation="vertical"
                sx={{ display: { xs: "none", sm: "block" } }}
              />

              <Button variant="text" onClick={stepBackwardOnce}>
                Step −
              </Button>
              <Button variant="text" onClick={stepForwardOnce}>
                Step +
              </Button>

              <Box sx={{ flex: 1 }} />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                Step {currentStepIndex} / {Math.max(steps.length - 1, 0)}
              </Typography>
            </Stack>

            {/* “Explain what the algorithm is doing right now” section */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary" noWrap>
                {currentStep ? formatWindowLabel(currentStep) : ""}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                Comparing/Writing indices:{" "}
                {currentStep?.activeIndices?.join(", ") ?? ""}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Visualization panel: the bars + the current snapshot */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                height: 280,
                display: "flex",
                alignItems: "flex-end",
                gap: "2px",

                // padding keeps bars from touching the paper edge
                p: 1.5,
                borderRadius: 2,

                // subtle background so bar movement is easier to see
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              {displayedArray.map((value, index) => {
                // Convert a raw number into a percentage of the chart height.
                const heightPercent = (value / maxBarValue) * 100;

                // Highlight bars that are involved in the current step.
                const isActive = activeSet.has(index);

                return (
                  <Box
                    key={index}
                    title={`Index ${index}: ${value}`}
                    sx={{
                      flex: 1,

                      /**
                       * This is the “animation”: bar heights change as we move through steps.
                       * We keep a minimum height so small values are still visible.
                       */
                      height: `${Math.max(2, heightPercent)}%`,

                      bgcolor: isActive ? "primary.main" : "text.secondary",
                      borderRadius: 0.5,

                      // Smooth transitions so stepping feels readable
                      transition:
                        "height 100ms linear, background-color 100ms linear",

                      // De-emphasize non-active bars a little
                      opacity: isActive ? 1 : 0.65,
                    }}
                  />
                );
              })}
            </Box>

            {/* Debug/learning view: seeing the array as numbers is useful while studying */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Current array snapshot
              </Typography>
              <Box
                component="pre"
                sx={{
                  mt: 1,
                  mb: 0,
                  p: 1.5,
                  borderRadius: 2,
                  overflowX: "auto",
                  fontSize: 12,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.04)",
                }}
              >
                {JSON.stringify(displayedArray)}
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
