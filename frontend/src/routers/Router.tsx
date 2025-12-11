import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Rooms from "@/pages/NavLinks/Rooms";
import Messages from "@/pages/NavLinks/Messages";
import Schedules from "@/pages/NavLinks/Schedules";
import EditRoom from "@/admin/EditRoom";
import Dashboard from "@/admin/Dashboard";
import Login from "@/pages/login/login";
import Signup from "@/pages/sign_up/signup";
import { ProtectedRoute } from "./ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "rooms", element: <Rooms /> },
      { path: "schedules", element: <Schedules /> },
      { path: "messages", element: <Messages /> },
      { path: "admin/edit-room", element: <EditRoom /> },
      { path: "admin/dashboard", element: <Dashboard /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

export default router;
