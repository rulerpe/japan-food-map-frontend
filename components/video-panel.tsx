import React from "react";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
} from "@nextui-org/modal";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { MapIcon } from "@heroicons/react/24/solid";
import { Link } from "@nextui-org/link";

interface VideoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  restaurantInfo: {
    name: string;
    rating: number;
    numReviews: number;
    googleMapsUrl: string;
  };
}

const VideoPanel: React.FC<VideoPanelProps> = ({
  isOpen,
  onClose,
  videoId,
  restaurantInfo,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIconOutline className="h-5 w-5 text-yellow-400" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarIconOutline key={i} className="h-5 w-5 text-yellow-400" />
        );
      }
    }

    return stars;
  };

  const openGoogleMaps = () => {
    window.open(restaurantInfo.googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="md"
      scrollBehavior="inside"
      backdrop="opaque"
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      classNames={{
        base: "bg-white dark:bg-gray-800", // Light background in light mode, slightly darker in dark mode
        header: "border-b border-gray-200 dark:border-gray-700",
        footer: "border-t border-gray-200 dark:border-gray-700",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-start">
              <h2 className="text-lg font-bold">{restaurantInfo.name}</h2>
            </ModalHeader>
            <ModalBody className="p-0">
              <div className="w-full" style={{ height: "100vh" }}>
                <iframe
                  title={restaurantInfo.name}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between items-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center">
                  {renderStars(restaurantInfo.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {restaurantInfo.numReviews} reviews
                </span>
              </div>
              <Button
                color="primary"
                startContent={<MapIcon className="h-5 w-5" />}
                onPress={openGoogleMaps}
              >
                Google Maps
              </Button>
              <Button onPress={onClose}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default VideoPanel;
