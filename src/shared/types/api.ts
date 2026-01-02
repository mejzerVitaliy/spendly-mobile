interface ApiResponse<T> {
  message: string;
  data: T;
}

export type { ApiResponse };