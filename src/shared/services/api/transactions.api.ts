import { CreateTransactionRequest, CreateTransactionResponse, GetAllTransactionsResponse, GetTransactionByIdResponse, ParseTextTransactionRequest, ParseTextTransactionResponse, UpdateTransactionRequest, UpdateTransactionResponse } from "@/shared/types";
import { apiClient } from "./api";

const create = async (request: CreateTransactionRequest): Promise<CreateTransactionResponse> => {
  const response = await apiClient.post(
    "/transaction",
    request
  );

  return response.data;
};

interface GetAllTransactionsParams {
  startDate?: string;
  endDate?: string;
  search?: string;
}

const getAll = async (params?: GetAllTransactionsParams): Promise<GetAllTransactionsResponse> => {
  const response = await apiClient.get("/transaction", {
    params,
  });

  return response.data;
};

const getById = async (id: string): Promise<GetTransactionByIdResponse> => {
  const response = await apiClient.get(`/transaction/${id}`);

  return response.data;
};

const update = async (id: string, request: UpdateTransactionRequest): Promise<UpdateTransactionResponse> => {
  const response = await apiClient.put(`/transaction/${id}`, request);

  return response.data;
};

const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`/transaction/${id}`);
};

const parseText = async (request: ParseTextTransactionRequest): Promise<ParseTextTransactionResponse> => {
  const response = await apiClient.post("/transaction/parse-text", request);
  return response.data;
};

export const transactionsApi = {
  create,
  getAll,
  getById,
  update,
  remove,
  parseText,
};

