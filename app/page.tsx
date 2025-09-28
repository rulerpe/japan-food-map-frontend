"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "../utils/supabase/client";

import VideoPanel from "../components/video-panel";
import { customLocationsMock } from "../config/mocks";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;


interface Restaurant {
  id: number;
  created_at: string;
  business_name?: string;
  channel_id?: string;
  description?: string;
  duration?: string;
  food_type?: string;
  formatted_address?: string;
  latitude: number;
  like_count?: number;
  longitude: number;
  num_reviews?: number;
  place_id?: string;
  published_date?: string;
  rating?: number;
  restaurant_name?: string;
  title?: string;
  video_id?: string;
  view_count?: number;
}

interface CustomLocation {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  name?: string;
}

export default function Home() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const supabase = createClient();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [customLocations, setCustomLocations] =
    useState<CustomLocation[]>(customLocationsMock);

  const getRestaurantsInView = useCallback(
    async (bounds: mapboxgl.LngLatBounds): Promise<Restaurant[]> => {
      try {
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .gte("latitude", bounds.getSouth())
          .lte("latitude", bounds.getNorth())
          .gte("longitude", bounds.getWest())
          .lte("longitude", bounds.getEast())
          .order("rating", { ascending: false })
          .limit(30);

        if (error) {
          console.error("Error fetching restaurants: ", error);
          return [];
        }
        console.log("Bounds south: ", bounds.getSouth());
        console.log("Fetched restaurants: ", data);
        return data || [];
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
        return [];
      }
    },
    []
  );

  const addRestaurantsMarkers = useCallback((restaurants: Restaurant[]) => {
    if (!map.current) return;
    restaurants.forEach((restaurant) => {
      if (!map.current) return;

      const marker = new mapboxgl.Marker()
        .setLngLat([restaurant.longitude, restaurant.latitude])
        .addTo(map.current);

      marker.getElement().addEventListener("click", () => {
        console.log("marker clicked");
        setSelectedRestaurant(restaurant);
        setIsPanelOpen(true);
      });
      markers.current.push(marker);
    });
  }, []);

  const getCustomLocationInView = useCallback(
    async (bounds: mapboxgl.LngLatBounds): Promise<CustomLocation[]> => {
      try {
        return customLocations.filter((location) => {
          console.log("location: ", location);
          return (
            location.latitude >= bounds.getSouth() &&
            location.latitude <= bounds.getNorth() &&
            location.longitude >= bounds.getWest() &&
            location.longitude <= bounds.getEast()
          );
        });
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
        return [];
      }
    },
    []
  );

  const addCustomLocationMarkers = useCallback(
    (customLocationsInView: CustomLocation[]) => {
      if (!map.current) return;
      customLocationsInView.forEach((location) => {
        if (!map.current) return;

        const marker = new mapboxgl.Marker({ color: "#0000FF" })
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current);

        marker.getElement().addEventListener("click", () => {
          console.log("marker clicked");
          // setSelectedRestaurant(restaurant);
          // setIsPanelOpen(true);
        });
        markers.current.push(marker);
      });
    },
    []
  );

  const updateMarkers = useCallback(async () => {
    if (!map.current) return;
    const bounds = map.current.getBounds();
    if (!bounds) return;
    const restaurants = await getRestaurantsInView(bounds);
    // const customLocationsInView = await getCustomLocationInView(bounds);
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    addRestaurantsMarkers(restaurants);
    // addCustomLocationMarkers(customLocationsInView);
  }, [getRestaurantsInView, addRestaurantsMarkers]);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [135.5, 34.6],
      zoom: 9,
    });

    map.current.on("load", () => {
      updateMarkers();
    });
    map.current.on("moveend", updateMarkers);

    return () => {
      console.log("remvoe");
      // if (map.current) {
      //   map.current.off("moveend", updateMarkers);
      //   map.current.remove();
      // }
    };
  }, [updateMarkers]);

  return (
    <>
      <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }}></div>
      {selectedRestaurant && (
        <VideoPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          videoId={selectedRestaurant.video_id || ""}
          restaurantInfo={{
            name: selectedRestaurant.restaurant_name || "Unknown Restaurant",
            rating: selectedRestaurant.rating || 0,
            numReviews: selectedRestaurant.num_reviews || 0,
            googleMapsUrl: selectedRestaurant.place_id
              ? `https://www.google.com/maps/place/?q=place_id:${selectedRestaurant.place_id}`
              : "#",
          }}
        />
      )}
    </>
  );
}
