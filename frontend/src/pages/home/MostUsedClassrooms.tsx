import { useEffect, useState } from "react";
import { RoomCard } from "@/components/RoomCard";
import type { Room } from "@/components/RoomCard";

const MostUsedClassrooms = () => {
  const [mostUsed, setMostUsed] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMostUsed = async () => {
    try {
      const stored = localStorage.getItem("classrooms");
      if (stored) {
        const data: Room[] = JSON.parse(stored);
        setMostUsed(data.filter((room) => room.popularity));
      } else {
        const response = await fetch("/classrooms.json");
        const data: Room[] = await response.json();
        setMostUsed(data.filter((room) => room.popularity));
        localStorage.setItem("classrooms", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to fetch classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMostUsed();

    // 🔁 Listen for any updates in room availability
    const handleRoomsUpdate = () => loadMostUsed();
    window.addEventListener("roomsUpdated", handleRoomsUpdate);

    return () => {
      window.removeEventListener("roomsUpdated", handleRoomsUpdate);
    };
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
        <p className="text-muted-foreground">No popular classrooms found.</p>
      )}
    </section>
  );
};

export default MostUsedClassrooms;
