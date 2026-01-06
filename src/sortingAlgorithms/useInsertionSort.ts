function generateRandomArray(arrayLength: number, maxValue: number): number[] {
  const randomValues: number[] = [];
  for (let index = 0; index < arrayLength; index++) {
    randomValues.push(Math.floor(Math.random() * maxValue));
  }
  return randomValues;
}

export function insertionSort(values: number[]): number[] {
  const sortedValues: number[] = [...values];

  for (
    let currentIndex = 1;
    currentIndex < sortedValues.length;
    currentIndex++
  ) {
    const valueToInsert: number = sortedValues[currentIndex];
    let positionIndex: number = currentIndex - 1;

    while (positionIndex >= 0 && sortedValues[positionIndex] > valueToInsert) {
      sortedValues[positionIndex + 1] = sortedValues[positionIndex];
      positionIndex -= 1;
    }

    sortedValues[positionIndex + 1] = valueToInsert;
  }

  return sortedValues;
}

// Example usage
const insertionSortRandomArray = generateRandomArray(10, 100);
console.log("Original Array (Insertion Sort):", insertionSortRandomArray);
console.log(
  "Sorted Array (Insertion Sort):",
  insertionSort(insertionSortRandomArray)
);
