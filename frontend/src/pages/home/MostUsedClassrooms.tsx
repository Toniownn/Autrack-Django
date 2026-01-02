import { useEffect, useState } from "react";
import { RoomCard } from "@/components/RoomCard";
import type { Room } from "@/components/RoomCard";

const MostUsedClassrooms = () => {
  const [mostUsed, setMostUsed] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMostUsed = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/rooms/");
      if (!response.ok) throw new Error("Failed to fetch rooms");

      const data = await response.json();
      const rooms: Room[] = data.rooms || [];

      // If you have a popularity field, you can filter here
      // setMostUsed(rooms.filter((room) => room.popularity));

      setMostUsed(rooms); // Display all rooms for now
    } catch (error) {
      console.error("Failed to fetch classrooms:", error);
      setMostUsed([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMostUsed();

    // Optional: listen for room updates
    const handleRoomsUpdate = () => loadMostUsed();
    window.addEventListener("roomsUpdated", handleRoomsUpdate);
    return () => window.removeEventListener("roomsUpdated", handleRoomsUpdate);
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading classrooms...</p>;
  }

  return (
    <section className="my-10">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">
        Most Used Classrooms
      </h2>

      {mostUsed.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {mostUsed.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No classrooms found.</p>
      )}
    </section>
  );
};

export default MostUsedClassrooms;
