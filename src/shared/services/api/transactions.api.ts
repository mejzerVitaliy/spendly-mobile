import { CreateTransactionRequest, CreateTransactionResponse, GetAllTransactionsResponse, GetTransactionByIdResponse, UpdateTransactionRequest, UpdateTransactionResponse } from "@/shared/types";
import { apiClient } from "./api";

const create = async (request: CreateTransactionRequest): Promise<CreateTransactionResponse> => {
  const response = await apiClient.post(
    "/transaction",
    request
  );

  return response.data;
};

const getAll = async (): Promise<GetAllTransactionsResponse> => {
  const response = await apiClient.get("/transaction");

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

export const transactionsApi = {
  create,
  getAll,
  getById,
  update,
  remove,
};

