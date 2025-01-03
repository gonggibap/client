'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';

import { Polygon, RestaurantDetailCategory } from '@/types/restaurant';

import { useAuthStore } from '@/store/useAuthStore';

import { CategoryFilter } from '@/app/_components/CategoryFilter';
import { FirstLoading } from '@/app/_components/FirstLoading';
import { MapCrosshair } from '@/app/_components/MapCrosshair';
import { Sidebar } from '@/app/_components/sidebar/Sidebar';

import { useGetRestaurants } from '@/apis/restaurant';

import { useKakaoMap } from '@/hooks/useKakaoMap';
import { useMapCluster } from '@/hooks/useMapCluster';
import { useMapMarkers } from '@/hooks/useMapMarkers';

import { MdRefresh } from 'react-icons/md';

export function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const auth = useAuthStore();

  const [polygon, setPolygon] = useState<Polygon | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);
  const [selectedCategory, setSelectedCategory] =
    useState<RestaurantDetailCategory>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [favorite, setFavorite] = useState<boolean>(false);

  const { data: restaurants } = useGetRestaurants(
    polygon,
    currentPage,
    selectedCategory,
    searchKeyword,
    favorite,
  );

  // 찜한 목록 보기
  const handleFavoriteRestaurantFilter = (value: boolean) => {
    setFavorite(value);
    setSelectedRestaurantId(null);
    if (auth.isLogin) {
      setPolygon(null);
    }
  };

  // 상세 정보 조회
  const handleRestaurantSelect = (id: number | null) => {
    setSelectedRestaurantId(id);
    // 선택된 식당 위치로 지도 이동
    if (id && mapInstance && restaurants?.content) {
      const selected = restaurants.content.find((r) => r.restaurantId === id);
      if (selected) {
        // zoom 조정 후 이동
        mapInstance.setLevel(3);
        mapInstance.setCenter(
          new kakao.maps.LatLng(
            selected.restaurantLatitude,
            selected.restaurantLongitude,
          ),
        );
      }
    }
  };

  // 카테고리 변경
  const handleCategorySelect = (category: RestaurantDetailCategory) => {
    setCurrentPage(0); // 카테고리 변경 시 페이지 리셋
    setSearchKeyword(''); // 카테고리 변경 시 검색어 리셋
    setSelectedCategory(category);
    if (!polygon && mapInstance) {
      mapInstance.setLevel(13);
    }
    // 카테고리 변경시 검색어 파라미터 제거
    router.push('/', { scroll: false });
  };

  // 검색 핸들러
  const handleRestaurantSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setSelectedCategory(null);
    setPolygon(null); // 검색시 polygon초기화
    setSelectedRestaurantId(null);
    setCurrentPage(0);

    // URL 업데이트
    if (keyword) {
      router.push(`?keyword=${encodeURIComponent(keyword)}`, { scroll: false });
    } else {
      router.push('/', { scroll: false });
    }

    // 검색시 전국 줌레벨로 이동
    if (mapInstance) {
      mapInstance.setLevel(13);
    }
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const {
    mapRef,
    mapInstance,
    handleSearch,
    moveToCurrentLocation,
    onKakaoMapLoad,
    isDragging,
  } = useKakaoMap({
    onPolygonChange: setPolygon,
  });

  const { cluster } = useMapCluster({
    map: mapInstance,
  });

  const { clearMarkers: clearMapMarkers } = useMapMarkers({
    map: mapInstance,
    restaurants: restaurants?.content || [],
    cluster,
    selectedRestaurantId,
    onRestaurantSelect: handleRestaurantSelect,
  });

  useEffect(() => {
    const keyword = searchParams.get('keyword');
    // mapInstance가 존재하고 완전히 초기화되었는지 확인
    if (keyword && mapInstance && mapInstance.getCenter()) {
      handleRestaurantSearch(keyword);
    }
  }, [mapInstance]);

  // 현재 위치 + favorite 상태 초기화
  const handleMoveToCurrentLocation = () => {
    moveToCurrentLocation();
    setFavorite(false);
  };

  // favorite 상태 변경시
  useEffect(() => {
    if (favorite === true) {
      mapInstance?.setLevel(13);
    } else if (favorite === false) {
      moveToCurrentLocation();
    }
  }, [favorite]);

  return (
    <>
      {mapInstance ? (
        <>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            onSearch={handleRestaurantSearch}
            isFavorite={favorite}
          />
          <Sidebar
            restaurants={restaurants?.content}
            totalPages={restaurants?.totalPages}
            selectedRestaurantId={selectedRestaurantId}
            onRestaurantSelect={handleRestaurantSelect}
            onCurrentLocation={handleMoveToCurrentLocation}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onSelectCategory={handleCategorySelect}
            onRestaurantSearch={handleRestaurantSearch}
            isFavorite={favorite}
            onFavoriteRestaurantFilter={handleFavoriteRestaurantFilter}
          />

          {!favorite && (
            <button
              onClick={() => {
                clearMapMarkers();
                handleSearch();
                handlePageChange(0);
                setSelectedRestaurantId(null);
                setSearchKeyword('');
                setFavorite(false);
              }}
              className="fixed left-1/2 top-28 z-10 -translate-x-1/2 gap-1 rounded-3xl bg-[#FF7058] px-4 py-2 text-sm font-semibold text-white shadow-lg flex-center hover:bg-[#FF6147] focus:outline-none md:bottom-12 md:left-[calc(50%+10rem)] md:top-auto md:px-6 md:py-3 md:text-lg"
              aria-label="현 지도에서 재검색">
              <MdRefresh />현 지도에서 재검색
            </button>
          )}
        </>
      ) : (
        <FirstLoading />
      )}
      <Script
        strategy="afterInteractive"
        type="text/javascript"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT}&libraries=services,clusterer&autoload=false`}
        onLoad={onKakaoMapLoad}
      />
      <div ref={mapRef} className="h-screen w-screen" />
      {isDragging && <MapCrosshair />}
    </>
  );
}
