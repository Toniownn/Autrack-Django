import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Rooms from "@/pages/NavLinks/Rooms";
import Messages from "@/pages/NavLinks/Messages";
import Schedules from "@/pages/NavLinks/Schedules";
import EditRoom from "@/admin/EditRoom";
import Dashboard from "@/admin/Dashboard";



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "rooms",
        element: <Rooms />,
      },
      {
        path: "schedules",
        element: <Schedules />,
      },
      {
        path: "messages", // ✅ updated route
        element: <Messages />,
      },
      {
        path: "admin/edit-room",
        element: <EditRoom />,
      },
      {
        path: "admin/dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);

export default router;
