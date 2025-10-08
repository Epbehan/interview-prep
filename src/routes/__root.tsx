import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import { MenuList, MenuItem, Typography, Drawer, Box } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const drawerWidth = 200;

export const Route = createRootRoute({
  component: () => (
    <>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#f8f9fc",
              borderRight: "2px solid lightgray",
            },
          }}
        >
          <MenuList disablePadding sx={{ mt: 2 }}>
            <MenuItem
              component={Link}
              to="/"
              sx={{ py: 1, px: 2 }}
              disableGutters
            >
              Home
            </MenuItem>

            <Accordion
              elevation={0}
              disableGutters
              square
              sx={{
                bgcolor: "transparent",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="algorithms-content"
                id="algorithms-header"
                sx={{
                  px: 2,
                  minHeight: 40,
                  "& .MuiAccordionSummary-content": {
                    my: 0,
                    alignItems: "center",
                  },
                }}
              >
                <Typography component="span">Algorithms</Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                <MenuList disablePadding>
                  <MenuItem
                    component={Link}
                    to="/algorithms/sorting"
                    sx={{ py: 1, px: 2 }}
                    disableGutters
                  >
                    Sorting
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/algorithms/searching"
                    sx={{ py: 1, px: 2 }}
                    disableGutters
                  >
                    Searching
                  </MenuItem>
                </MenuList>
              </AccordionDetails>
            </Accordion>

            <MenuItem
              component={Link}
              to="/organigram"
              sx={{ py: 1, px: 2 }}
              disableGutters
            >
              Organigram
            </MenuItem>
          </MenuList>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, ml: 3, p: 5 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Interview Prep
          </Typography>
          <Outlet />
        </Box>
      </Box>

      <TanstackDevtools
        config={{ position: "bottom-left" }}
        plugins={[
          { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
        ]}
      />
    </>
  ),
});
