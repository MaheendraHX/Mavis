import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Mavis could not find its application root element.");
}

const router = getRouter();

createRoot(rootElement).render(<RouterProvider router={router} />);
