import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateReview } from "@/apis/review";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";

type ReviewFormProps = {
  restaurantId: number;
  onClickWriteReview: () => void;
};

interface ReviewFormData {
  content: string;
  point: number;
  images: File[];
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  restaurantId,
  onClickWriteReview,
}) => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ReviewFormData>({
    defaultValues: {
      content: "",
      point: 0,
      images: []
    }
  });

  const createReviewMutation = useCreateReview();
  const point = watch("point");
  const queryClient = useQueryClient();

  const handleStarClick = (star: number) => {
    setValue("point", star);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 3); // 최대 3장까지 업로드 가능
      setUploadedImages(newImages);
      setValue("images", newImages);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue("images", newImages);
  };

  const onSubmit = handleSubmit((data) => {
    if (data.point === 0) {
      toast.error("별점을 선택해주세요");
    }

    createReviewMutation.mutate(
      {
        restaurantId,
        content: data.content,
        point: data.point,
        images: uploadedImages
      },
      {
        onSuccess: () => {
          toast.success("리뷰가 등록되었습니다");
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.REVIEW.DETAIL(restaurantId)]
          });
          onClickWriteReview(); // 성공 시 폼 닫기
        },
        onError: (error) => {
          toast.error("리뷰 등록에 실패했습니다");
        },
      }
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex-between-center">
        <h2 className="text-xl font-bold">리뷰 작성</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Rating selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">별점</label>
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                className={`p-1 w-8 h-8`}
              >
                <span className={`${point >= star ? "text-yellow-400" : "text-gray-300"} hover:text-gray-400`}>★</span>
              </button>
            ))}
          </div>
          {errors.point && (
            <p className="text-red-500 text-xs">별점을 선택해주세요.</p>
          )}
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">사진 첨부</label>
          <div className="flex gap-2">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`업로드 이미지 ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 dark:bg-gray-800 dark:sm:bg-gray-700 rounded-full p-1"
                >
                  ✕
                </button>
              </div>
            ))}

            {uploadedImages.length < 3 && (
              <label className="w-20 h-20 flex-col-center bg-gray-100 md:dark:bg-gray-800 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900">
                <span className="text-xs">사진 추가</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">최대 3장까지 업로드 가능</p>
        </div>

        {/* Review content */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">리뷰 작성</label>
          <textarea
            {...register("content", {
              required: "리뷰를 작성해주세요",
              minLength: {
                value: 10,
                message: "리뷰는 최소 10자 이상 작성해주세요",
              },
            })}
            placeholder="음식과 서비스는 어떠셨나요? (최소 10자 이상)"
            className="w-full h-32 px-3 py-2 bg-gray-100 md:dark:bg-gray-800 dark:bg-gray-700 rounded-lg resize-none"
          />
          {errors.content && (
            <p className="text-red-500 text-xs">{errors.content.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createReviewMutation.isPending}
            className="flex-1 py-2 px-4 bg-[#FF7058] md:dark:bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-[#ff7158da] dark:hover:bg-gray-900 disabled:opacity-50"
          >
            {createReviewMutation.isPending ? "등록 중..." : "리뷰 등록"}
          </button>
          <button
            type="button"
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-400 rounded-lg hover:bg-gray-100"
            onClick={onClickWriteReview}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};