import { CreateTransactionRequest, CreateTransactionResponse, CreateTransferRequest, CreateTransferResponse, GetAllTransactionsResponse, GetRecurringDueResponse, GetTransactionByIdResponse, ParseTextTransactionRequest, ParseTextTransactionResponse, ParseVoiceTransactionResponse, PreviewTransactionResponse, ProcessRecurringResponse, UpdateTransactionRequest, UpdateTransactionResponse, UpdateTransferRequest, UpdateTransferResponse } from "@/shared/types";
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

const parseVoice = async (audioUri: string): Promise<ParseVoiceTransactionResponse> => {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  } as any);

  const response = await apiClient.post("/transaction/parse-voice", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const previewText = async (text: string): Promise<PreviewTransactionResponse> => {
  const response = await apiClient.post("/transaction/preview-text", { text });
  return response.data;
};

const previewVoice = async (audioUri: string): Promise<PreviewTransactionResponse> => {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  } as any);

  const response = await apiClient.post("/transaction/preview-voice", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const createTransfer = async (request: CreateTransferRequest): Promise<CreateTransferResponse> => {
  const response = await apiClient.post("/transaction/transfer", request);
  return response.data;
};

const updateTransfer = async (transferGroupId: string, request: UpdateTransferRequest): Promise<UpdateTransferResponse> => {
  const response = await apiClient.put(`/transaction/transfer/${transferGroupId}`, request);
  return response.data;
};

const getRecurringDue = async (): Promise<GetRecurringDueResponse> => {
  const response = await apiClient.get("/transaction/recurring/due");
  return response.data;
};

const processRecurring = async (id: string): Promise<ProcessRecurringResponse> => {
  const response = await apiClient.post(`/transaction/recurring/${id}/process`);
  return response.data;
};

const getRecurringProcessedToday = async (): Promise<{ data: { count: number } }> => {
  const response = await apiClient.get('/transaction/recurring/processed-today');
  return response.data;
};

export const transactionsApi = {
  create,
  createTransfer,
  updateTransfer,
  getAll,
  getById,
  update,
  remove,
  parseText,
  parseVoice,
  previewText,
  previewVoice,
  getRecurringDue,
  processRecurring,
  getRecurringProcessedToday,
};

