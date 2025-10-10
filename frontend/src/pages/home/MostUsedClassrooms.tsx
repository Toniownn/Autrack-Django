import { useEffect, useState } from "react";
import { RoomCard } from "@/components/RoomCard";
import type { Room } from "@/components/RoomCard";

const MostUsedClassrooms = () => {
  const [mostUsed, setMostUsed] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        // Fetch from the public folder
        const response = await fetch("/classrooms.json");
        const data: Room[] = await response.json();

        // Filter rooms marked as popular
        setMostUsed(data.filter((room) => room.popularity));
      } catch (error) {
        console.error("Failed to fetch classrooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
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
