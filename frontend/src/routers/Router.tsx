import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Rooms from "@/pages/NavLinks/Rooms";

import Instructors from "@/pages/NavLinks/Instructors";
import Schedules from "@/pages/NavLinks/Schedules";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true, // ✅ default route for "/"
        element: <Home />,
      },
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/rooms",
        element: <Rooms />,
      },  
      {
        path: "/schedules",
        element: <Schedules />,
      },
      {
        path: "/instructors",
        element: <Instructors />,
      },
    ],
  },
]);

export default router;
