function generateRandomArray(arrayLength: number, maxValue: number): number[] {
  const randomValues: number[] = [];
  for (let index = 0; index < arrayLength; index++) {
    randomValues.push(Math.floor(Math.random() * maxValue));
  }
  return randomValues;
}

export function selectionSort(values: number[]): number[] {
  const sortedValues: number[] = [...values];
  const length: number = sortedValues.length;

  for (let currentIndex = 0; currentIndex < length - 1; currentIndex++) {
    let indexOfSmallestValue: number = currentIndex;

    for (
      let searchIndex = currentIndex + 1;
      searchIndex < length;
      searchIndex++
    ) {
      if (sortedValues[searchIndex] < sortedValues[indexOfSmallestValue]) {
        indexOfSmallestValue = searchIndex;
      }
    }

    if (indexOfSmallestValue !== currentIndex) {
      const temporaryValue = sortedValues[currentIndex];
      sortedValues[currentIndex] = sortedValues[indexOfSmallestValue];
      sortedValues[indexOfSmallestValue] = temporaryValue;
    }
  }

  return sortedValues;
}

// Example usage
const selectionSortRandomArray = generateRandomArray(10, 100);
console.log("Original Array (Selection Sort):", selectionSortRandomArray);
console.log(
  "Sorted Array (Selection Sort):",
  selectionSort(selectionSortRandomArray)
);
