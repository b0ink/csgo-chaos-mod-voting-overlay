import React from "react";
import { createRoot } from "react-dom/client";

import Voting from "./Voting/Voting";
import Setup from "./Setup/Setup";

const components = {
    Voting,
    Setup,
};

/* Determine whether to load the Setup or Voting componenent */
const Page = components[new URLSearchParams(location.search).get("page")];
if (!Page) Page = Setup;

const root = document.getElementById("root");
createRoot(root).render(<Page />);
