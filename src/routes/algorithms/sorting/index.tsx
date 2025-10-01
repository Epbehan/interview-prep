import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/algorithms/sorting/")({
  component: () => (
    <div>
      <h3>Pick a sorting algorithm above.</h3>
      <p>
        Sorting algorithms are fundamental techniques in computer science used
        to arrange data into a specific order, typically ascending or
        descending. <br />
        They form the backbone of many applications, from searching and data
        analysis to optimization problems.
        <br /> Each algorithm takes a different approach—some are simple and
        intuitive, while others are more efficient and powerful for large
        datasets. <br />
        Use the tabs above to explore common sorting methods, understand how
        they work, and compare their strengths and trade-offs.
      </p>
    </div>
  ),
});
