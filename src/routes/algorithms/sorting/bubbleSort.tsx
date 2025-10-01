import { createFileRoute } from "@tanstack/react-router";

function BubbleSortPage() {
  return (
    <div>
      <h3>Bubble Sort</h3>
      <p>
        Bubble Sort is a simple sorting algorithm that repeatedly steps through
        the list, compares adjacent elements, and swaps them if they are in the
        wrong order. The pass through the list is repeated until the list is
        sorted. The algorithm gets its name because smaller elements "bubble" to
        the top of the list with each iteration.
      </p>
    </div>
  );
}

export const Route = createFileRoute("/algorithms/sorting/bubbleSort")({
  component: BubbleSortPage,
});
