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

type QuickStep = {
  arraySnapshot: number[];
  activeIndices: number[]; // typically pivot + i/j
  pivotIndex: number | null;
  rangeStart: number;
  rangeEnd: number; // inclusive
  actionLabel:
    | "choose-pivot"
    | "compare"
    | "swap"
    | "pivot-swap"
    | "partition-done"
    | "done";
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

function buildQuickSortSteps(values: number[]): QuickStep[] {
  const steps: QuickStep[] = [];
  const workingArray = values.slice();

  const recordStep = (
    snapshot: number[],
    active: number[],
    pivotIndex: number | null,
    rangeStart: number,
    rangeEnd: number,
    action: QuickStep["actionLabel"]
  ) => {
    steps.push({
      arraySnapshot: snapshot.slice(),
      activeIndices: active.slice(),
      pivotIndex,
      rangeStart,
      rangeEnd,
      actionLabel: action,
    });
  };

  const swap = (a: number[], left: number, right: number) => {
    const temp = a[left];
    a[left] = a[right];
    a[right] = temp;
  };

  const partition = (low: number, high: number): number => {
    // pivot at high
    const pivotIndex = high;
    const pivotValue = workingArray[pivotIndex];

    recordStep(
      workingArray,
      [pivotIndex],
      pivotIndex,
      low,
      high,
      "choose-pivot"
    );

    let i = low; // place for next value < pivot

    for (let j = low; j < high; j += 1) {
      recordStep(
        workingArray,
        [pivotIndex, i, j],
        pivotIndex,
        low,
        high,
        "compare"
      );

      if (workingArray[j] < pivotValue) {
        if (i !== j) {
          swap(workingArray, i, j);
          recordStep(
            workingArray,
            [pivotIndex, i, j],
            pivotIndex,
            low,
            high,
            "swap"
          );
        }
        i += 1;
      }
    }

    // put pivot into its final position
    if (i !== pivotIndex) {
      swap(workingArray, i, pivotIndex);
      recordStep(
        workingArray,
        [i, pivotIndex],
        pivotIndex,
        low,
        high,
        "pivot-swap"
      );
    }

    recordStep(workingArray, [i], i, low, high, "partition-done");
    return i;
  };

  // explicit stack to avoid recursion depth concerns + easier to record range
  const stack: Array<{ low: number; high: number }> = [];
  stack.push({ low: 0, high: workingArray.length - 1 });

  recordStep(
    workingArray,
    [],
    null,
    0,
    Math.max(0, workingArray.length - 1),
    "choose-pivot"
  );

  while (stack.length > 0) {
    const { low, high } = stack.pop()!;

    if (low >= high) continue;

    const pivotFinalIndex = partition(low, high);

    // Push right then left so left is processed next (LIFO), but order doesn't matter for correctness.
    if (pivotFinalIndex + 1 < high) {
      stack.push({ low: pivotFinalIndex + 1, high });
    }
    if (low < pivotFinalIndex - 1) {
      stack.push({ low, high: pivotFinalIndex - 1 });
    }
  }

  recordStep(
    workingArray,
    [],
    null,
    0,
    Math.max(0, workingArray.length - 1),
    "done"
  );
  return steps;
}

function actionText(label: QuickStep["actionLabel"]): string {
  switch (label) {
    case "choose-pivot":
      return "Choosing pivot for current range";
    case "compare":
      return "Comparing value to pivot";
    case "swap":
      return "Swapping to move smaller value left";
    case "pivot-swap":
      return "Placing pivot into final position";
    case "partition-done":
      return "Partition complete";
    case "done":
      return "Array sorted";
    default:
      return "";
  }
}

export default function QuickSortVisualizer() {
  const [arrayLength, setArrayLength] = useState(32);
  const [maxValue, setMaxValue] = useState(100);
  const [animationDelayMs, setAnimationDelayMs] = useState(30);

  const [values, setValues] = useState(() => generateRandomArray(32, 100));
  const [steps, setSteps] = useState(() => buildQuickSortSteps(values));
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
    setSteps(buildQuickSortSteps(nextValues));
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
  const pivotIndex = currentStep?.pivotIndex ?? null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          Quick Sort Visualizer
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Quick sort partitions around a pivot, then sorts the left and right
          partitions.
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

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary" noWrap>
                {actionText(currentStep?.actionLabel ?? "choose-pivot")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Range: [{currentStep?.rangeStart ?? 0},{" "}
                {currentStep?.rangeEnd ?? 0}]
              </Typography>
            </Stack>
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
              const isPivot = pivotIndex === index;

              return (
                <Box
                  key={index}
                  title={`Index ${index}: ${value}`}
                  sx={{
                    flex: 1,
                    height: `${Math.max(2, height)}%`,
                    bgcolor: isPivot
                      ? "warning.main"
                      : isActive
                        ? "primary.main"
                        : "text.secondary",
                    opacity: isPivot ? 1 : 0.9,
                    transition:
                      "height 100ms linear, background-color 100ms linear",
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
