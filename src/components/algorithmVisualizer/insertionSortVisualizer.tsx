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

type InsertionStep = {
  arraySnapshot: number[];
  activeIndices: number[];
  sortedBoundaryIndex: number; // last index of the sorted prefix (0..sortedBoundaryIndex)
  actionLabel: "select" | "compare" | "shift" | "insert" | "done";
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

function buildInsertionSortSteps(values: number[]): InsertionStep[] {
  const steps: InsertionStep[] = [];
  const workingArray = values.slice();

  const recordStep = (
    snapshot: number[],
    active: number[],
    sortedBoundaryIndex: number,
    action: InsertionStep["actionLabel"]
  ) => {
    steps.push({
      arraySnapshot: snapshot.slice(),
      activeIndices: active.slice(),
      sortedBoundaryIndex,
      actionLabel: action,
    });
  };

  const length = workingArray.length;

  // initial frame: sorted prefix is just index 0
  recordStep(workingArray, [], Math.max(0, Math.min(0, length - 1)), "select");

  for (let i = 1; i < length; i += 1) {
    const key = workingArray[i];
    let j = i - 1;

    recordStep(workingArray, [i], i - 1, "select");

    while (j >= 0) {
      recordStep(workingArray, [j, j + 1], i - 1, "compare");

      if (workingArray[j] <= key) {
        break;
      }

      // shift right
      workingArray[j + 1] = workingArray[j];
      recordStep(workingArray, [j, j + 1], i - 1, "shift");
      j -= 1;
    }

    // insert key into the hole at j+1
    workingArray[j + 1] = key;
    recordStep(workingArray, [j + 1], i, "insert");
  }

  recordStep(workingArray, [], length - 1, "done");
  return steps;
}

function actionText(label: InsertionStep["actionLabel"]): string {
  switch (label) {
    case "select":
      return "Selecting next element to insert";
    case "compare":
      return "Comparing against sorted prefix";
    case "shift":
      return "Shifting larger value right";
    case "insert":
      return "Inserting element into correct position";
    case "done":
      return "Array sorted";
    default:
      return "";
  }
}

export default function InsertionSortVisualizer() {
  const [arrayLength, setArrayLength] = useState(32);
  const [maxValue, setMaxValue] = useState(100);
  const [animationDelayMs, setAnimationDelayMs] = useState(30);

  const [values, setValues] = useState(() => generateRandomArray(32, 100));
  const [steps, setSteps] = useState(() => buildInsertionSortSteps(values));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const intervalRef = useRef<number | null>(null);

  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];
  const displayedArray = currentStep?.arraySnapshot ?? values;

  const maxBarValue = useMemo(
    () => Math.max(...displayedArray, 1),
    [displayedArray]
  );

  const randomizeValues = () => {
    const nextValues = generateRandomArray(arrayLength, maxValue);
    setValues(nextValues);
    setSteps(buildInsertionSortSteps(nextValues));
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
  const sortedBoundary = currentStep?.sortedBoundaryIndex ?? 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          Insertion Sort Visualizer
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Insertion sort grows a sorted prefix by inserting each new element
          into the correct position.
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

            <Stack
              direction="row"
              spacing={1.5}
              flexWrap="wrap"
              alignItems="center"
            >
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
              {actionText(currentStep?.actionLabel ?? "select")} · Sorted prefix
              ends at index {sortedBoundary}
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
              const isInSortedPrefix = index <= sortedBoundary;

              return (
                <Box
                  key={index}
                  title={`Index ${index}: ${value}`}
                  sx={{
                    flex: 1,
                    height: `${Math.max(2, height)}%`,
                    bgcolor: isActive ? "primary.main" : "text.secondary",
                    opacity: isInSortedPrefix ? 0.6 : 1,
                    transition: "height 100ms linear, opacity 100ms linear",
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
