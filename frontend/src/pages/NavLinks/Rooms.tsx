import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoomCard } from "@/components/RoomCard";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, X } from "lucide-react";

interface Classroom {
  id: number;
  name: string;
  status: boolean;
  department: string;
  image: string;
  popularity: boolean;
}

const Rooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Classroom[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  const loadClassrooms = async () => {
    try {
      const stored = localStorage.getItem("classrooms");
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      let data: Classroom[] = [];

      if (stored) {
        data = JSON.parse(stored);
      } else {
        const res = await fetch("/classrooms.json");
        data = await res.json();
        localStorage.setItem("classrooms", JSON.stringify(data));
      }

      const updatedData = data.map((room) => {
        const hasActiveBooking = bookings.some((b: any) => {
          if (b.roomName !== room.name) return false;
          if (b.date !== today) return false;
          return b.startTime <= currentTime && b.endTime > currentTime;
        });
        return { ...room, status: !hasActiveBooking };
      });

      setClassrooms(updatedData);
      setFilteredRooms(updatedData);
      localStorage.setItem("classrooms", JSON.stringify(updatedData));
    } catch (err) {
      console.error("Failed to load classrooms:", err);
    }
  };

  useEffect(() => {
    loadClassrooms();

    const onRoomsUpdate = () => loadClassrooms();
    window.addEventListener("roomsUpdated", onRoomsUpdate);
    window.addEventListener("bookingsUpdated", onRoomsUpdate);

    const instantUpdate = setInterval(() => {
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      const shouldUpdate = bookings.some(
        (b: any) =>
          b.date === today &&
          b.startTime <= currentTime &&
          b.endTime > currentTime
      );

      if (shouldUpdate) {
        window.dispatchEvent(new Event("roomsUpdated"));
      }
    }, 10000);

    return () => {
      clearInterval(instantUpdate);
      window.removeEventListener("roomsUpdated", onRoomsUpdate);
      window.removeEventListener("bookingsUpdated", onRoomsUpdate);
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      window.dispatchEvent(new Event("roomsUpdated"));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let filtered = classrooms;

    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (room) => room.department === departmentFilter
      );
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((room) =>
        room.name.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredRooms(filtered);
  }, [departmentFilter, searchTerm, classrooms]);

  const clearFilters = () => {
    setDepartmentFilter("all");
    setSearchTerm("");
  };

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Classrooms</h1>
          <Button
            onClick={() => navigate("/admin/edit-room")}
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold"
          >
            Edit Rooms
          </Button>
        </div>

        {/* 🔹 Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-border"
                >
                  Department:{" "}
                  <span className="font-medium capitalize">
                    {departmentFilter === "all"
                      ? "All"
                      : departmentFilter.replace(" Department", "")}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => setDepartmentFilter("all")}>
                  All Departments
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDepartmentFilter("COT Department")}
                >
                  COT Department
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDepartmentFilter("CEAS Department")}
                >
                  CEAS Department
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDepartmentFilter("COE Department")}
                >
                  COE Department
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDepartmentFilter("COTBM Department")}
                >
                  COTBM Department
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {(departmentFilter !== "all" || searchTerm !== "") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search room name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <p className="text-muted-foreground">No classrooms found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} showBookButton />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Rooms;
