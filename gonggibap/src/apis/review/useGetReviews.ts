import { useEffect } from 'react';

import {
  UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { BaseResponse, ErrorResponse } from '@/types/apiResponse';
import { GetReviewResponse } from '@/types/review';

import { client } from '@/apis/core/client';

import { getVisiblePageNumbers } from '@/utils/getVisiblePageNumbers ';

import { QUERY_KEYS } from '@/constants/queryKeys';

const getReviews = async (
  restaurantId: number,
  page: number,
): Promise<GetReviewResponse> => {
  const params: Record<string, number> = {
    page,
  };
  const response = await client.get<BaseResponse<GetReviewResponse>>({
    url: `reviews/restaurant/${restaurantId}`,
    params,
  });
  return response.data;
};

export const useGetReviews = (
  restaurantId: number,
  page: number,
): UseQueryResult<GetReviewResponse, AxiosError<ErrorResponse>> => {
  const queryClient = useQueryClient();

  const query = useQuery<GetReviewResponse, AxiosError<ErrorResponse>>({
    queryKey: QUERY_KEYS.REVIEW.DETAIL(restaurantId, page),
    queryFn: () => getReviews(restaurantId, page),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data?.totalPages) {
      const visiblePages = getVisiblePageNumbers(page, query.data.totalPages);

      visiblePages.forEach((targetPage) => {
        if (targetPage !== page) {
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.REVIEW.DETAIL(restaurantId, targetPage),
            queryFn: () => getReviews(restaurantId, targetPage),
            staleTime: 1000 * 60 * 5,
          });
        }
      });
    }
  }, [restaurantId, queryClient, page, query.data?.totalPages]);

  return query;
};
