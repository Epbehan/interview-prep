import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/algorithms/sorting/selectionSort")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h3>Selection Sort</h3>
      <p>
        Selection Sort repeatedly finds the smallest element from the unsorted
        portion of the list and places it at the beginning. With each pass, the
        sorted section grows, and the unsorted section shrinks, until the list
        is fully sorted.
      </p>
    </div>
  );
}
