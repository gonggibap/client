// components/RestaurantDetailView.tsx
import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { Restaurant } from "@/types/restaurant";
import { useAuthStore } from "@/store/useAuthStore";
import { ReviewForm } from "@/app/_components/ReviewForm";
import { useDeleteReview, useGetReviews } from "@/apis/review";
import { QUERY_KEYS } from "@/constants/queryKeys";

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
  const auth = useAuthStore();
  const queryClient = useQueryClient();
  const { data: reviews } = useGetReviews(restaurant.restaurantId);
  const deleteReviewMutation = useDeleteReview();
  const [isWriting, setIsWriting] = useState<boolean>(false);

  const onClickWriteReview = () => setIsWriting((prev) => !prev);

  const onDeleteReview = (reviewId: number) => {
    deleteReviewMutation.mutate(reviewId, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.REVIEW.DETAIL(restaurant.restaurantId)],
        });
        toast.success("리뷰가 삭제되었습니다.");
      },
      onError: (error) => {
        toast.error("리뷰 삭제에 실패했습니다.");
        console.error(error);
      },
    });
  };
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
        <ReviewForm
          restaurantId={restaurant.restaurantId}
          onClickWriteReview={onClickWriteReview}
        />
      ) : (
        <>
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

          <div>
            <h3 className="text-lg font-bold mb-3">리뷰</h3>
            <div className="space-y-3">
              {reviews?.length ? (
                reviews.map((review) => (
                  <div
                    key={review.reviewId}
                    className="p-3 dark:bg-gray-700 rounded-lg border dark:border-none"
                  >
                    <div className="flex-between mb-2">
                      <p className="font-medium">{review.userName}</p>
                      <p className="text-yellow-400">
                        {"⭐".repeat(Math.round(review.point))}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {review.imageUrls &&
                        review.imageUrls.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt="리뷰 이미지"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ))}
                    </div>
                    <p className="text-sm mb-1">{review.content}</p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                    {review.userId === auth.userInfo?.id && (
                      <button onClick={() => onDeleteReview(review.reviewId)}>
                        삭제
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <div>작성된 리뷰가 없습니다.</div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
