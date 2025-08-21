import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="layout">
        {/* Sidebar */}
        <aside>
          <nav className="navbar-vertical">
            <Link to="/" className="nav-button">
              Home
            </Link>
            <Link to="/algorithms" className="nav-button">
              Algorithms
            </Link>
            <Link to="/organigram" className="nav-button">
              Organigram
            </Link>
          </nav>
        </aside>

        <main className="content">
          <h1>Interview Prep</h1>
          <Outlet />
        </main>
      </div>

      <TanstackDevtools
        config={{ position: "bottom-left" }}
        plugins={[
          { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
        ]}
      />
    </>
  ),
});
