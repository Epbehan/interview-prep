function generateRandomArray(arrayLength: number, maxValue: number): number[] {
  const randomValues: number[] = [];
  for (let index = 0; index < arrayLength; index++) {
    randomValues.push(Math.floor(Math.random() * maxValue));
  }
  return randomValues;
}

function mergeSortedArrays(
  leftValues: number[],
  rightValues: number[]
): number[] {
  const mergedValues: number[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < leftValues.length && rightIndex < rightValues.length) {
    if (leftValues[leftIndex] <= rightValues[rightIndex]) {
      mergedValues.push(leftValues[leftIndex]);
      leftIndex += 1;
    } else {
      mergedValues.push(rightValues[rightIndex]);
      rightIndex += 1;
    }
  }

  while (leftIndex < leftValues.length) {
    mergedValues.push(leftValues[leftIndex]);
    leftIndex += 1;
  }

  while (rightIndex < rightValues.length) {
    mergedValues.push(rightValues[rightIndex]);
    rightIndex += 1;
  }

  return mergedValues;
}

export function mergeSort(values: number[]): number[] {
  if (values.length <= 1) {
    return values;
  }

  const middleIndex: number = Math.floor(values.length / 2);
  const leftValues: number[] = values.slice(0, middleIndex);
  const rightValues: number[] = values.slice(middleIndex);

  const sortedLeftValues = mergeSort(leftValues);
  const sortedRightValues = mergeSort(rightValues);

  return mergeSortedArrays(sortedLeftValues, sortedRightValues);
}

// Example usage
const mergeSortRandomArray = generateRandomArray(10, 100);
console.log("Original Array (Merge Sort):", mergeSortRandomArray);
console.log("Sorted Array (Merge Sort):", mergeSort(mergeSortRandomArray));
