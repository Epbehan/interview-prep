function generateRandomArray(arrayLength: number, maxValue: number): number[] {
  const randomValues: number[] = [];
  for (let index = 0; index < arrayLength; index++) {
    randomValues.push(Math.floor(Math.random() * maxValue));
  }
  return randomValues;
}

export function quickSort(values: number[]): number[] {
  if (values.length <= 1) {
    return values;
  }

  const pivotIndex: number = Math.floor(values.length / 2);
  const pivotValue: number = values[pivotIndex];

  const smallerValues: number[] = [];
  const equalValues: number[] = [];
  const largerValues: number[] = [];

  for (const currentValue of values) {
    if (currentValue < pivotValue) {
      smallerValues.push(currentValue);
    } else if (currentValue > pivotValue) {
      largerValues.push(currentValue);
    } else {
      equalValues.push(currentValue);
    }
  }

  return [
    ...quickSort(smallerValues),
    ...equalValues,
    ...quickSort(largerValues),
  ];
}

// Example usage
const quickSortRandomArray = generateRandomArray(10, 100);
console.log("Original Array (Quick Sort):", quickSortRandomArray);
console.log("Sorted Array (Quick Sort):", quickSort(quickSortRandomArray));
