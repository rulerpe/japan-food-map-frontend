"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";

import VideoPanel from "../components/video-panel";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "japan-food-map.firebaseapp.com",
  projectId: "japan-food-map",
  storageBucket: "japan-food-map.appspot.com",
  messagingSenderId: "462477636092",
  appId: "1:462477636092:web:d3bc269071f5d030d18279",
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
const db = getFirestore();

if (process.env.NODE_ENV === "development") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

interface Restaurant {
  video_id: string;
  restaurant_name: string;
  location: string;
  menu_item: string[];
  price: number[];
  order: number;
  latitude: number;
  longitude: number;
  formatted_address: string;
  rating: number;
  num_reviews: number;
  types: string[];
}

export default function Home() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const getRestaurantsInView = useCallback(
    async (bounds: mapboxgl.LngLatBounds): Promise<Restaurant[]> => {
      try {
        const restaurantsRef = collection(db, "restaurants");
        const q = query(
          restaurantsRef,
          where("latitude", ">=", bounds.getSouth()),
          where("latitude", "<=", bounds.getNorth()),
          where("longitude", ">=", bounds.getWest()),
          where("longitude", "<=", bounds.getEast()),
          orderBy("rating", "desc"),
          limit(30)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
          console.log("doc: ", doc.data());
          return { id: doc.id, ...(doc.data() as Restaurant) };
        });
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
        return [];
      }
    },
    []
  );

  const addMarkers = useCallback((restaurants: Restaurant[]) => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

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

  const updateRestaurants = useCallback(async () => {
    if (!map.current) return;
    const bounds = map.current.getBounds();
    console.log("bounds", bounds);
    if (!bounds) return;
    const restaurants = await getRestaurantsInView(bounds);
    console.log("restaurants", restaurants);
    addMarkers(restaurants);
  }, [getRestaurantsInView, addMarkers]);

  useEffect(() => {
    console.log("useEffect", mapContainer.current!);
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [135.5, 34.6],
      zoom: 9,
    });

    map.current.on("load", () => {
      updateRestaurants();
    });
    map.current.on("moveend", updateRestaurants);

    return () => {
      console.log("remvoe");
      // if (map.current) {
      //   map.current.off("moveend", updateRestaurants);
      //   map.current.remove();
      // }
    };
  }, [updateRestaurants]);

  return (
    <>
      <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }}></div>
      {selectedRestaurant && (
        <VideoPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          videoId={selectedRestaurant.video_id}
          restaurantInfo={{
            name: selectedRestaurant.restaurant_name,
            rating: selectedRestaurant.rating,
            numReviews: selectedRestaurant.num_reviews,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRestaurant.formatted_address)}`,
          }}
        />
      )}
    </>
  );
}