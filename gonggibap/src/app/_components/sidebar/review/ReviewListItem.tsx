import { useState } from 'react';

import { Review } from '@/types/review';

import { useAuthStore } from '@/store/useAuthStore';

import {
  StarRating,
  ReviewImages,
  DeleteReviewDialog,
} from '@/app/_components/sidebar/review';

import { useDeleteReview } from '@/apis/review';

import { getRelativeTime } from '@/utils/getRelativeTime';

type ReviewListItemProps = {
  review: Review;
  restaurantId: number;
  handleOpenForm: (mode: 'create' | 'edit', review?: Review) => void;
  currentPage: number;
};

export const ReviewListItem = ({
  review,
  restaurantId,
  handleOpenForm,
  currentPage,
}: ReviewListItemProps) => {
  const auth = useAuthStore();
  const { mutate: onDeleteReview, isPending: isDeleting } = useDeleteReview();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteReview = () => {
    onDeleteReview({
      reviewId: review.reviewId,
      restaurantId,
      page: currentPage,
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <li className="flex flex-col gap-1 border-b pb-4 dark:border-gray-500">
      <div className="flex items-center gap-2">
        <p className="text-md font-bold">{review.userName}</p>
        <div className="flex gap-1 text-xs font-semibold">
          <p className="text-gray-500">리뷰</p>
          <p>{review.userReviewCount}</p>
        </div>
        <div className="flex gap-1 text-xs font-semibold">
          <p className="text-gray-500">평균별점</p>
          <p>{review.userReviewAvg.toFixed(1)}</p>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <StarRating rating={review.point} />
          <div className="text-xs text-gray-500">
            {getRelativeTime(review.date)}
          </div>
        </div>
        {review.userId === auth.userInfo?.userId && (
          <div className="flex gap-1">
            <button
              onClick={() => handleOpenForm('edit', review)}
              disabled={isDeleting}
              className={`rounded-xl bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-gray-400${
                isDeleting ? ' cursor-not-allowed opacity-50' : ''
              }`}
              aria-label="리뷰 수정">
              수정
            </button>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
              className={`rounded-xl bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-gray-400${
                isDeleting ? ' cursor-not-allowed opacity-50' : ''
              }`}
              aria-label="리뷰 삭제">
              삭제
            </button>
            <DeleteReviewDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              isDeleting={isDeleting}
              onDelete={handleDeleteReview}
            />
          </div>
        )}
      </div>

      <p className="text-sm">{review.content}</p>
      {review.imageUrls.length > 0 && (
        <ReviewImages imageUrls={review.imageUrls} />
      )}
    </li>
  );
};
