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

type MergeStep = {
  arraySnapshot: number[];
  activeIndices: number[];
  windowStart: number;
  windowMid: number;
  windowEnd: number;
};

function generateRandomArray(arrayLength: number, maxValue: number): number[] {
  const randomValues: number[] = [];
  for (let index = 0; index < arrayLength; index += 1) {
    randomValues.push(Math.floor(Math.random() * maxValue));
  }
  return randomValues;
}

function clampInteger(
  value: number,
  minValue: number,
  maxValue: number
): number {
  return Math.max(minValue, Math.min(maxValue, Math.floor(value)));
}

/** Precompute merge sort snapshots for animation/stepping. */
function buildMergeSortSteps(values: number[]): MergeStep[] {
  const steps: MergeStep[] = [];

  // Source/target arrays we swap each pass
  const workingArray: number[] = values.slice();
  const auxiliaryArray: number[] = values.slice();

  const recordStep = (
    snapshotSource: number[],
    activeIndices: number[],
    windowStart: number,
    windowMid: number,
    windowEnd: number
  ) => {
    steps.push({
      arraySnapshot: snapshotSource.slice(),
      activeIndices: activeIndices.slice(),
      windowStart,
      windowMid,
      windowEnd,
    });
  };

  // Merge two sorted halves from source into target, recording each write.
  const mergeIntoTarget = (
    sourceArray: number[],
    targetArray: number[],
    leftStart: number,
    mid: number,
    rightEnd: number
  ) => {
    let leftIndex = leftStart;
    let rightIndex = mid;

    for (let writeIndex = leftStart; writeIndex < rightEnd; writeIndex += 1) {
      const leftIsExhausted = leftIndex >= mid;
      const rightIsExhausted = rightIndex >= rightEnd;

      const shouldTakeRight =
        !rightIsExhausted &&
        (leftIsExhausted || sourceArray[rightIndex] < sourceArray[leftIndex]);

      if (shouldTakeRight) {
        targetArray[writeIndex] = sourceArray[rightIndex];
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

  // Initial frame
  recordStep(workingArray, [], 0, 0, workingArray.length);

  // Bottom-up merge sort: widths 1, 2, 4, ...
  let width = 1;
  let sourceArray = workingArray;
  let targetArray = auxiliaryArray;

  while (width < values.length) {
    for (let leftStart = 0; leftStart < values.length; leftStart += 2 * width) {
      const mid = Math.min(leftStart + width, values.length);
      const rightEnd = Math.min(leftStart + 2 * width, values.length);

      // If only one block remains, copy it over
      if (mid >= rightEnd) {
        for (let index = leftStart; index < rightEnd; index += 1) {
          targetArray[index] = sourceArray[index];
          recordStep(targetArray, [index], leftStart, mid, rightEnd);
        }
        continue;
      }

      mergeIntoTarget(sourceArray, targetArray, leftStart, mid, rightEnd);
    }

    // Swap source/target for next pass
    const previousSourceArray = sourceArray;
    sourceArray = targetArray;
    targetArray = previousSourceArray;

    width *= 2;
  }

  // Final frame
  recordStep(sourceArray, [], 0, Math.floor(values.length / 2), values.length);

  return steps;
}

function formatWindowLabel(step: MergeStep): string {
  if (step.windowEnd <= step.windowStart) return "";
  return `Merging [${step.windowStart}, ${step.windowMid}) + [${step.windowMid}, ${step.windowEnd})`;
}

export default function MergeSortVisualizer() {
  const [arrayLength, setArrayLength] = useState<number>(32);
  const [maxValue, setMaxValue] = useState<number>(100);
  const [animationDelayMs, setAnimationDelayMs] = useState<number>(30);

  const [values, setValues] = useState<number[]>(() =>
    generateRandomArray(32, 100)
  );
  const [steps, setSteps] = useState<MergeStep[]>(() =>
    buildMergeSortSteps(values)
  );

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const animationIntervalIdRef = useRef<number | null>(null);

  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];

  // Normalize bar heights
  const maxBarValue = useMemo(() => {
    return Math.max(...(currentStep?.arraySnapshot ?? values), 1);
  }, [currentStep, values]);

  const randomizeValues = () => {
    const nextValues = generateRandomArray(arrayLength, maxValue);
    setValues(nextValues);
    setSteps(buildMergeSortSteps(nextValues));
    setCurrentStepIndex(0);
    setIsAnimating(false);
  };

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

  // Timer to advance frames
  useEffect(() => {
    const cleanupStep = () => {
      if (animationIntervalIdRef.current !== null) {
        window.clearInterval(animationIntervalIdRef.current);
        animationIntervalIdRef.current = null;
      }
    };

    cleanupStep();

    if (!isAnimating) return cleanupStep;

    animationIntervalIdRef.current = window.setInterval(
      () => {
        setCurrentStepIndex((previousIndex) => {
          const nextIndex = previousIndex + 1;
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

  // Clamp initial values
  useEffect(() => {
    setArrayLength((previous) => clampInteger(previous, 2, 160));
    setMaxValue((previous) => clampInteger(previous, 5, 1000));
    setAnimationDelayMs((previous) => clampInteger(previous, 1, 500));
  }, []);

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

        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                height: 280,
                display: "flex",
                alignItems: "flex-end",
                gap: "2px",
                p: 1.5,
                borderRadius: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              {displayedArray.map((value, index) => {
                const heightPercent = (value / maxBarValue) * 100;
                const isActive = activeSet.has(index);

                return (
                  <Box
                    key={index}
                    title={`Index ${index}: ${value}`}
                    sx={{
                      flex: 1,
                      height: `${Math.max(2, heightPercent)}%`,
                      bgcolor: isActive ? "primary.main" : "text.secondary",
                      borderRadius: 0.5,
                      transition:
                        "height 100ms linear, background-color 100ms linear",
                      opacity: isActive ? 1 : 0.65,
                    }}
                  />
                );
              })}
            </Box>

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
