import React, { useEffect, useState } from "react";
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
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetch("/classrooms.json")
      .then((res) => res.json())
      .then((data) => {
        setClassrooms(data);
        setFilteredRooms(data);
      })
      .catch((err) => console.error("Failed to load classrooms:", err));
  }, []);

  // 🔹 Apply filters and live search
  useEffect(() => {
    let filtered = classrooms;

    if (availabilityFilter === "available") {
      filtered = filtered.filter((room) => room.status === true);
    } else if (availabilityFilter === "occupied") {
      filtered = filtered.filter((room) => room.status === false);
    }

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
  }, [availabilityFilter, departmentFilter, searchTerm, classrooms]);

  const clearFilters = () => {
    setAvailabilityFilter("all");
    setDepartmentFilter("all");
    setSearchTerm("");
  };

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Classrooms</h1>

        {/* 🔹 Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Availability Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-border"
                >
                  Availability:{" "}
                  <span className="font-medium capitalize">
                    {availabilityFilter}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => setAvailabilityFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAvailabilityFilter("available")}
                >
                  Available
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAvailabilityFilter("occupied")}
                >
                  Occupied
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Department Filter */}
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

            {/* Clear Filters Button */}
            {(availabilityFilter !== "all" ||
              departmentFilter !== "all" ||
              searchTerm !== "") && (
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

          {/* Search Input */}
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

        {/* 🔹 Rooms Grid */}
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
