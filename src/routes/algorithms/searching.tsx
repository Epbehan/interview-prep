import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/algorithms/searching")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Hello
      <br></br>
      This is the Searching Algorithms page!
    </div>
  );
}
