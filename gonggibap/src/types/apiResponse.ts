export interface BaseResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}
