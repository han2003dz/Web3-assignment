import Web3 from "web3";
const web3 = new Web3(window.ethereum);
export const convertFromEthToWei = (amount) => {
  return web3.utils.toWei(amount, "ether");
};
export const convertFromWeiToEth = (amount) => {
  return web3.utils.fromWei(amount, "ether");
};
