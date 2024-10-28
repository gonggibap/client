import { useEffect, useRef, useState } from "react";
import { Polygon } from "@/types/restaurant";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";

interface UseKakaoMapProps {
  onPolygonChange: (polygon: Polygon) => void;
}

export const useKakaoMap = ({ onPolygonChange }: UseKakaoMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const { getCurrentLocation } = useCurrentLocation();

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      const { latitude: lat, longitude: lng } = await getCurrentLocation();
      const options = {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 3,
      };

      const map = new window.kakao.maps.Map(mapRef.current, options);
      mapInstanceRef.current = map;

      // 현재 위치에 마커 추가
      const markerPosition = new window.kakao.maps.LatLng(lat, lng);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });
      marker.setMap(map);

      handleSearch();
    } catch (error) {
      handleMapInitError(error);
    }
  };

  const handleMapInitError = (error: unknown) => {
    if (!mapRef.current) return;

    if (error instanceof GeolocationPositionError) {
      if (error.code === 1) {
        alert("위치 권한을 허용해주세요");
      }
      if (error.code === 2) {
        alert("위치를 가져올 수 없습니다");
      }
    }

    // 기본 위치(강남구청)로 초기화
    const options = {
      center: new window.kakao.maps.LatLng(37.517139, 127.047523),
      level: 3,
    };
    const map = new window.kakao.maps.Map(mapRef.current, options);
    mapInstanceRef.current = map;

    handleSearch();
  };

  const handleSearch = () => {
    if (!mapInstanceRef.current) return;

    const bounds = mapInstanceRef.current.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    onPolygonChange({
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
  };

  const moveToCurrentLocation = async () => {
    try {
      const { latitude: lat, longitude: lng } = await getCurrentLocation();

      if (!mapInstanceRef.current) return;

      mapInstanceRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
      mapInstanceRef.current.setLevel(3);
      handleSearch();
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        if (error.code === 1) {
          alert("위치 권한을 허용해주세요");
        }
        if (error.code === 2) {
          alert("위치를 가져올 수 없습니다");
        }
      }
    }
  };
  // 카카오맵 SDK 초기화 후 mapLoaded 상태 변경
  const onKakaoMapLoad = () => {
    window.kakao.maps.load(() => {
      setMapLoaded(true);
    });
  };

  // mapLoaded가 true가 되면 지도 초기화
  useEffect(() => {
    if (mapLoaded) {
      initializeMap();
    }
  }, [mapLoaded]);

  return {
    mapRef,
    mapInstance: mapInstanceRef.current,
    handleSearch,
    moveToCurrentLocation,
    onKakaoMapLoad,
  };
};
