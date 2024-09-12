import { get } from "../utils/request";

export const getTransactions = async () => {
  const result = await get("/transactions");
  return result.data;
};
