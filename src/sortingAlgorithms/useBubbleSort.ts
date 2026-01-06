function generateRandomArray(arrayLength: number, maxValue: number): number[] {
  const randomValues: number[] = [];
  for (let i = 0; i < arrayLength; i++) {
    randomValues.push(Math.floor(Math.random() * maxValue));
  }
  return randomValues;
}

export function bubbleSort(values: number[]): number[] {
  const sortedValues: number[] = [...values];
  const n: number = sortedValues.length;

  for (let i = 0; i < n - 1; i++) {
    let didSwap = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (sortedValues[j] > sortedValues[j + 1]) {
        const temp = sortedValues[j];
        sortedValues[j] = sortedValues[j + 1];
        sortedValues[j + 1] = temp;
        didSwap = true;
      }
    }
    if (!didSwap) break;
  }
  return sortedValues;
}

// Example usage
const randomArray = generateRandomArray(10, 100);
console.log("Original Array:", randomArray);
console.log("Sorted Array:", bubbleSort(randomArray));
