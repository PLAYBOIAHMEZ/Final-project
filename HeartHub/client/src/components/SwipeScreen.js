import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";

export default function SwipeScreen({
  profiles,
  currentIndex,
  setCurrentIndex,
  handleLike,
}) {
  const currentProfile = profiles[currentIndex];

  const onLikeClick = () => {
    console.log("Profile being liked:", currentProfile); // Debug log
    if (currentProfile && currentProfile._id) {
      handleLike(currentProfile._id);
    } else {
      console.log("No valid profile to like"); // Debug log
    }
  };

  if (!currentProfile) {
    return (
      <Card className="w-96 p-5 text-center">
        <CardContent>
          <h2 className="text-xl font-bold">No more profiles</h2>
          <p className="text-gray-500">Check back later for new matches!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96">
      <CardContent className="p-0">
        <div className="relative h-[500px]">
          <img
            src={currentProfile.imageUrl || "/images/default-avatar.png"}
            alt={currentProfile.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
            <h2 className="text-2xl font-bold">
              {currentProfile.name}, {currentProfile.age}
            </h2>
            <p className="mt-2">{currentProfile.bio}</p>
          </div>
        </div>
        <div className="flex justify-center gap-4 p-4">
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 border-red-500"
            onClick={() => setCurrentIndex((prev) => prev + 1)}
          >
            <X className="h-6 w-6 text-red-500" />
          </Button>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
            onClick={onLikeClick}
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
