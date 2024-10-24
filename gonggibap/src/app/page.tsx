"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Polygon } from "@/types/restaurant";
import { useGetRestaurants } from "@/apis/restaurant";
import { ThemeToggleBtn } from "@/app/_components/ThemeToggleBtn";
import { Sidebar } from "@/app/_components/Sidebar";
import { useDebounce } from "@/hooks/useDebounce";

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [polygon, setPolygon] = useState<Polygon | null>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  const debouncedPolygon = useDebounce(polygon, 500);

  const { data: restaurants } = useGetRestaurants(debouncedPolygon, 0);
  // 레스토랑 마커 업데이트를 위한 useEffect
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !restaurants ||
      restaurants.restaurantResponses.length < 1
    )
      return;

    // 기존 마커들 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새로운 마커들 생성
    restaurants.restaurantResponses.forEach((restaurant) => {
      const markerPosition = new window.kakao.maps.LatLng(
        restaurant.restaurantLatitude,
        restaurant.restaurantLongitude
      );
      if (!mapInstanceRef.current) {
        return;
      }
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: mapInstanceRef.current,
      });

      // 마커 클릭 이벤트 (일단 임시로 제목이랑 빈도수만 뜨게)
      window.kakao.maps.event.addListener(marker, "click", () => {
        // 마커 클릭시 실행할 코드
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div class="text-black p-5">${restaurant.restaurantName}:${restaurant.visitCount}</div>`,
        });
        if (!mapInstanceRef.current) {
          return;
        }
        infowindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [restaurants]);

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      // 현재 위치를 가져오는 함수
      const getCurrentPosition = () => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      };

      // 지도 초기화 함수
      const initializeMap = async () => {
        try {
          const position = await getCurrentPosition();
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const options = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 3,
          };
          if (!mapRef.current) return;
          const map = new window.kakao.maps.Map(mapRef.current, options);
          mapInstanceRef.current = map;

          // 현재 위치에 마커 추가
          const markerPosition = new window.kakao.maps.LatLng(lat, lng);
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
          });
          marker.setMap(map);

          window.kakao.maps.event.addListener(map, "idle", () => {
            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();

            setPolygon({
              firstCoordinate: {
                latitude: sw.getLat(),
                longitude: sw.getLng(),
              },
              secondCoordinate: {
                latitude: sw.getLat(),
                longitude: ne.getLng(),
              },
              thirdCoordinate: {
                latitude: ne.getLat(),
                longitude: ne.getLng(),
              },
              fourthCoordinate: {
                latitude: ne.getLat(),
                longitude: sw.getLng(),
              },
            });
          });
        } catch (error) {
          console.error(error);
          // 위치 정보를 가져오는 데 실패한 경우, 카카오본사
          if (!mapRef.current) return;
          const options = {
            center: new window.kakao.maps.LatLng(33.450701, 126.570667),
            level: 3,
          };
          new window.kakao.maps.Map(mapRef.current, options);
        }
      };

      initializeMap();
    }
  }, [mapLoaded]);

  const onKakaoMapLoad = () => {
    window.kakao.maps.load(() => setMapLoaded(true));
  };

  return (
    <>
      <Sidebar restaurants={restaurants?.restaurantResponses || []} />
      <Script
        strategy="afterInteractive"
        type="text/javascript"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT}&libraries=services&autoload=false`}
        onLoad={onKakaoMapLoad}
      />
      <div ref={mapRef} className="w-screen h-screen" />
      <ThemeToggleBtn />
    </>
  );
}
