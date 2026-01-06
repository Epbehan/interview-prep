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

type BubbleStep = {
  arraySnapshot: number[];
  activeIndices: number[];
  sortedIndices: number[];
  actionLabel: "compare" | "swap" | "pass-complete" | "done";
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

/**
 * Precompute bubble sort steps so we can animate and step through them.
 */
function buildBubbleSortSteps(values: number[]): BubbleStep[] {
  const steps: BubbleStep[] = [];
  const workingArray = values.slice();
  const sortedIndices: number[] = [];

  const recordStep = (
    snapshot: number[],
    active: number[],
    sorted: number[],
    action: BubbleStep["actionLabel"]
  ) => {
    steps.push({
      arraySnapshot: snapshot.slice(),
      activeIndices: active.slice(),
      sortedIndices: sorted.slice(),
      actionLabel: action,
    });
  };

  recordStep(workingArray, [], [], "compare");

  const length = workingArray.length;

  for (let pass = 0; pass < length - 1; pass += 1) {
    let didSwap = false;
    const unsortedEnd = length - pass - 1;

    for (let j = 0; j < unsortedEnd; j += 1) {
      recordStep(workingArray, [j, j + 1], sortedIndices, "compare");

      if (workingArray[j] > workingArray[j + 1]) {
        const temp = workingArray[j];
        workingArray[j] = workingArray[j + 1];
        workingArray[j + 1] = temp;

        didSwap = true;
        recordStep(workingArray, [j, j + 1], sortedIndices, "swap");
      }
    }

    sortedIndices.push(unsortedEnd);
    recordStep(workingArray, [], sortedIndices, "pass-complete");

    if (!didSwap) {
      for (let k = 0; k < unsortedEnd; k += 1) {
        if (!sortedIndices.includes(k)) sortedIndices.push(k);
      }
      recordStep(workingArray, [], sortedIndices, "done");
      return steps;
    }
  }

  sortedIndices.push(0);
  recordStep(workingArray, [], sortedIndices, "done");
  return steps;
}

function actionText(label: BubbleStep["actionLabel"]): string {
  switch (label) {
    case "compare":
      return "Comparing adjacent values";
    case "swap":
      return "Swapping out-of-order values";
    case "pass-complete":
      return "Pass complete";
    case "done":
      return "Array sorted";
    default:
      return "";
  }
}

export default function BubbleSortVisualizer() {
  const [arrayLength, setArrayLength] = useState(32);
  const [maxValue, setMaxValue] = useState(100);
  const [animationDelayMs, setAnimationDelayMs] = useState(30);

  const [values, setValues] = useState(() => generateRandomArray(32, 100));
  const [steps, setSteps] = useState(() => buildBubbleSortSteps(values));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];

  const maxBarValue = useMemo(
    () => Math.max(...(currentStep?.arraySnapshot ?? values), 1),
    [currentStep, values]
  );

  const randomizeValues = () => {
    const nextValues = generateRandomArray(arrayLength, maxValue);
    setValues(nextValues);
    setSteps(buildBubbleSortSteps(nextValues));
    setCurrentStepIndex(0);
    setIsAnimating(false);
  };

  const cleanupStep = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    cleanupStep();

    if (!isAnimating) return cleanupStep;

    intervalRef.current = window.setInterval(
      () => {
        setCurrentStepIndex((previous) => {
          const next = previous + 1;
          if (next >= steps.length) {
            setIsAnimating(false);
            return steps.length - 1;
          }
          return next;
        });
      },
      Math.max(1, animationDelayMs)
    );

    return cleanupStep;
  }, [isAnimating, animationDelayMs, steps.length]);

  useEffect(() => {
    setArrayLength((v) => clampInteger(v, 2, 160));
    setMaxValue((v) => clampInteger(v, 5, 1000));
    setAnimationDelayMs((v) => clampInteger(v, 1, 500));
  }, []);

  const activeSet = new Set(currentStep?.activeIndices ?? []);
  const sortedSet = new Set(currentStep?.sortedIndices ?? []);
  const displayedArray = currentStep?.arraySnapshot ?? values;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          Bubble Sort Visualizer
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Bubble sort compares adjacent values and swaps them until sorted.
        </Typography>

        <Paper sx={{ p: 2.5, mb: 3 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Array length"
                type="number"
                value={arrayLength}
                onChange={(e) =>
                  setArrayLength(clampInteger(Number(e.target.value), 2, 160))
                }
                fullWidth
              />
              <TextField
                label="Max value"
                type="number"
                value={maxValue}
                onChange={(e) =>
                  setMaxValue(clampInteger(Number(e.target.value), 5, 1000))
                }
                fullWidth
              />
              <TextField
                label="Speed (ms)"
                type="number"
                value={animationDelayMs}
                onChange={(e) =>
                  setAnimationDelayMs(
                    clampInteger(Number(e.target.value), 1, 500)
                  )
                }
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button variant="contained" onClick={randomizeValues}>
                Randomize
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsAnimating((v) => !v)}
              >
                {isAnimating ? "Pause" : "Play"}
              </Button>
              <Button onClick={() => setCurrentStepIndex(0)}>Reset</Button>
              <Button onClick={() => setCurrentStepIndex(steps.length - 1)}>
                End
              </Button>

              <Divider orientation="vertical" flexItem />

              <Button
                onClick={() => setCurrentStepIndex((i) => Math.max(i - 1, 0))}
              >
                Step −
              </Button>
              <Button
                onClick={() =>
                  setCurrentStepIndex((i) => Math.min(i + 1, steps.length - 1))
                }
              >
                Step +
              </Button>

              <Box sx={{ flex: 1 }} />
              <Typography variant="body2">
                Step {currentStepIndex} / {steps.length - 1}
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {actionText(currentStep?.actionLabel ?? "compare")}
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Box
            sx={{
              height: 280,
              display: "flex",
              alignItems: "flex-end",
              gap: "2px",
              p: 1.5,
              bgcolor: "action.hover",
            }}
          >
            {displayedArray.map((value, index) => {
              const height = (value / maxBarValue) * 100;
              const isActive = activeSet.has(index);
              const isSorted = sortedSet.has(index);

              return (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    height: `${Math.max(2, height)}%`,
                    bgcolor: isActive ? "primary.main" : "text.secondary",
                    opacity: isSorted ? 0.35 : 1,
                    transition: "height 100ms linear",
                  }}
                />
              );
            })}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
