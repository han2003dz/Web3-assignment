import { get } from "../utils/request";
import queryString from "query-string";
export const getTransactions = async (options) => {
  const queryParams = queryString.stringify({ ...options });
  console.log("queryParams", queryParams);
  const result = await get(`/transactions?${queryParams}`);
  return result.data;
};
