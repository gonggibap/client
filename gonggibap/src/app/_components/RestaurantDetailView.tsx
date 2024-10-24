// components/RestaurantDetailView.tsx
import { useState } from "react";
import { Restaurant } from "@/types/restaurant";
import { ReviewForm } from "@/app/_components/ReviewForm";

type RestaurantDetailViewProps = {
  restaurant: Restaurant;
  onClose?: () => void; // 웹 닫기 버튼
  isMobile?: boolean;
  onBack?: () => void; // 모바일 뒤로가기 버튼
};

export const RestaurantDetailView: React.FC<RestaurantDetailViewProps> = ({
  restaurant,
  onClose,
  isMobile,
  onBack,
}) => {
  const [isWriting, setIsWriting] = useState<boolean>(false);
  // 리뷰 작성 폼 토글
  const onClickWriteReview = () => setIsWriting((prev) => !prev);

  return (
    <div className="space-y-6">
      {/* 모바일일 때는 뒤로가기, 웹일 때는 닫기 버튼 */}
      {isMobile ? (
        <button
          onClick={onBack}
          className="mb-4 px-2 py-1 text-sm rounded dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-none"
        >
          ← 목록으로
        </button>
      ) : (
        <button
          onClick={onClose}
          className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
          aria-label="닫기"
        >
          ✕
        </button>
      )}

      <div>
        <h2 className="text-xl font-bold mb-2">{restaurant.restaurantName}</h2>
        <div className="space-y-2">
          <p>⭐ {restaurant.visitCount}</p>
          <p>📍 {restaurant.restaurantRoadAddressName}</p>
          <p>🕒 openingHours</p>
          <p>📞 phoneNumber</p>
        </div>
      </div>

      {isWriting ? (
        <ReviewForm onClickWriteReview={onClickWriteReview} />
      ) : (
        <>
          <div>
            <div className="flex justify-end mb-3">
              <button
                onClick={onClickWriteReview}
                className={`p-2 rounded-lg text-white bg-[#FF7058] text-right ${
                  isMobile ? "dark:bg-gray-700" : "dark:bg-gray-800"
                }`}
              >
                리뷰 작성
              </button>
            </div>

            <h3 className="text-lg font-bold mb-3">메뉴</h3>
            {/* <div className="space-y-3">
              {restaurant.details.menu.map((item) => (
                <div
                  key={item.id}
                  className="p-3 dark:bg-gray-700 rounded-lg border dark:border-none"
                >
                  <div className="flex-between">
                    <span className="font-medium">{item.name}</span>
                    <span>{item.price.toLocaleString()}원</span>
                  </div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div> */}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">리뷰</h3>
            {/* <div className="space-y-3">
              {restaurant.details.reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-3 dark:bg-gray-700 rounded-lg border dark:border-none"
                >
                  <div className="flex-between mb-2">
                    <span className="font-medium">{review.userName}</span>
                    <span className="text-yellow-400">
                      {"⭐".repeat(review.rating)}
                    </span>
                  </div>
                  <p className="text-sm mb-1">{review.content}</p>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
              ))}
            </div> */}
          </div>
        </>
      )}
    </div>
  );
};
