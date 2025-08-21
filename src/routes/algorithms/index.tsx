import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/algorithms/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <nav className="algorithms-nav">
        <Link to="/algorithms/sorting" className="algorithms-button">
          Sorting
        </Link>
        <Link to="/algorithms/searching" className="algorithms-button">
          Searching
        </Link>
      </nav>
      Hello "/Algorithms"!
    </div>
  );
}
