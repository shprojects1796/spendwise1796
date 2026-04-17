import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import { useStore } from "./store/useStore";

import BudgetPage from "./pages/BudgetPage";
// Lazy pages — will be populated as page files are added
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";

function RootComponent() {
  const { darkMode, isLoggedIn } = useStore();

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  return isLoggedIn ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Outlet />
  );
}

const rootRoute = createRootRoute({ component: RootComponent });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

function requireAuth() {
  const { isLoggedIn } = useStore.getState();
  if (!isLoggedIn) {
    throw redirect({ to: "/login" });
  }
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: requireAuth,
  component: DashboardPage,
});

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  beforeLoad: requireAuth,
  component: ExpensesPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  beforeLoad: requireAuth,
  component: ReportsPage,
});

const budgetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/budget",
  beforeLoad: requireAuth,
  component: BudgetPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  expensesRoute,
  reportsRoute,
  budgetRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
