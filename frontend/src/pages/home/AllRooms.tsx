import { useEffect, useState } from "react";
import { RoomCard } from "@/components/RoomCard";
import type { Room } from "@/components/RoomCard";

type FilterType = "all" | "active" | "inactive";

const AllRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const loadRooms = async (filter: FilterType) => {
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/rooms/all/"; // default all
      if (filter === "active") url = "http://localhost:8000/api/rooms/active/";
      if (filter === "inactive")
        url = "http://localhost:8000/api/rooms/inactive/";

      const res = await fetch(url);
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(filter);
  }, [filter]);

  return (
    <section className="my-10">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">Rooms</h2>

      {/* Tabs for filtering */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md font-medium ${
            filter === "all"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-md font-medium ${
            filter === "active"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("inactive")}
          className={`px-4 py-2 rounded-md font-medium ${
            filter === "inactive"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Inactive
        </button>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <p className="text-muted-foreground">Loading rooms...</p>
      ) : rooms.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No rooms found.</p>
      )}
    </section>
  );
};

export default AllRooms;
