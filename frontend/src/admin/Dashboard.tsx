import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";

interface Room {
  id: number;
  name: string;
  department: string;
  status: boolean;
  image: string;
  popularity: boolean;
}

interface Instructor {
  id: number;
  department: string;
}

interface Booking {
  id: string;
  roomName: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  confirmed?: boolean;
  status?: "pending" | "confirmed" | "ongoing";
}

const COLORS = ["#FFA500", "#FF4500", "#1E40AF", "#10B981", "#8B5CF6"];

// Custom legend formatter to add gap
const renderLegend = (value: any) => (
  <span style={{ marginRight: 15 }}>{value}</span>
);

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-2 rounded shadow-lg"
        style={{
          backgroundColor: document.documentElement.classList.contains("dark")
            ? "#1F2937"
            : "#FFFFFF",
          color: document.documentElement.classList.contains("dark")
            ? "#F9FAFB"
            : "#111827",
          border: "1px solid",
          borderColor: document.documentElement.classList.contains("dark")
            ? "#374151"
            : "#D1D5DB",
        }}
      >
        <p className="font-semibold">{label}</p>
        <p>Value: {payload[0].value}</p>
      </div>
    );
  }

  return null;
};

const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadData = () => {
    const roomsData: Room[] = JSON.parse(
      localStorage.getItem("classrooms") || "[]"
    );
    const bookingsData: Booking[] = JSON.parse(
      localStorage.getItem("bookings") || "[]"
    );

    setRooms(roomsData);
    setBookings(bookingsData);
  };

  useEffect(() => {
    loadData();

    fetch("/instructors.json")
      .then((res) => res.json())
      .then((data) => setInstructors(data))
      .catch((err) => console.error("Failed to load instructors:", err));

    const handleUpdate = () => loadData();
    window.addEventListener("roomsUpdated", handleUpdate);
    window.addEventListener("bookingsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("roomsUpdated", handleUpdate);
      window.removeEventListener("bookingsUpdated", handleUpdate);
    };
  }, []);

  const roomsByDept = Array.from(
    rooms.reduce((map, r) => {
      let dept = r.department || "Unknown";
      dept = dept.replace(/\s*Department\s*$/, "");
      map.set(dept, (map.get(dept) || 0) + 1);
      return map;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }));

  const instructorsByDept = Array.from(
    instructors.reduce((map, i) => {
      if (i.department === "Admin Department") return map;
      let dept = i.department || "Unknown";
      dept = dept.replace(/\s*Department\s*$/, "");
      map.set(dept, (map.get(dept) || 0) + 1);
      return map;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }));

  const totalVisitors = bookings.length;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Dashboard</h1>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent>
            <h2 className="text-sm font-medium text-muted-foreground">
              Total Rooms
            </h2>
            <p className="text-2xl font-bold">{rooms.length}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent>
            <h2 className="text-sm font-medium text-muted-foreground">
              Total Instructors
            </h2>
            <p className="text-2xl font-bold">{instructors.length - 1}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent>
            <h2 className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </h2>
            <p className="text-2xl font-bold">{bookings.length}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent>
            <h2 className="text-sm font-medium text-muted-foreground">
              Total Visitors
            </h2>
            <p className="text-2xl font-bold">{totalVisitors}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rooms per Department */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Rooms by Department</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomsByDept}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {roomsByDept.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Instructors per Department */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Instructors by Department</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={instructorsByDept}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={0}
                  textAnchor="middle"
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  <LabelList dataKey="value" position="top" />
                  {instructorsByDept.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
