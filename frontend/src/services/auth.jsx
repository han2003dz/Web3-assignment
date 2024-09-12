import { get, post } from "../utils/request";

export const login = async (publicAddress) => {
  const result = await post("/auth/login", { publicAddress });
  console.log("result", result);
  return result.data;
};

export const verify = async (publicAddress, signature) => {
  const result = await post("/auth/verify", { publicAddress, signature });
  return result;
};

export const refresh = async () => {
  const result = await get("/auth/refresh");
  return result;
};
