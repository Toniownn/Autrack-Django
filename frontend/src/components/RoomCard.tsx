import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getImgUrl } from "@/lib/getImgurl";
import BookingModal from "@/modals/BookingModal";

export interface Room {
  id: number;
  name: string;
  status: boolean;
  department: string;
  image: string;
  popularity: boolean;
}

interface RoomCardProps {
  room: Room;
  showBookButton?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, showBookButton }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Automatically handle both base64 and static URLs
  const resolveImage = (image: string): string => {
    if (!image) return "";
    if (image.startsWith("data:image")) return image;
    return getImgUrl(image);
  };

  return (
    <>
      <Card className="overflow-hidden border hover:translate-y-[-2px] transition-transform duration-200">
        <img
          src={resolveImage(room.image)}
          alt={room.name}
          className="w-full h-40 object-cover"
        />
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{room.name}</h3>
            {room.popularity && (
              <span className="text-xs font-medium text-orange-500">
                🔥 Popular
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{room.department}</p>

          {showBookButton && (
            <Button
              className="mt-2 w-full"
              variant="default"
              onClick={() => setIsModalOpen(true)}
            >
              Book Now
            </Button>
          )}
        </CardContent>
      </Card>

      <BookingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={room}
      />
    </>
  );
};
