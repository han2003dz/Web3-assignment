export const formatAddress = (address) => {
  const newAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return newAddress;
};
