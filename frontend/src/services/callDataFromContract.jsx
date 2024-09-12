import Web3 from "web3";
import TokenERC20Artifact from "../contracts/MyTokenERC20.json";
import NftERC721Artifact from "../contracts/MyTokenERC721.json";
import LogicContractArtifact from "../contracts/Logic.json";
import ContractAddress from "../contracts/contract-address.json";

const web3 = new Web3(window.ethereum);

const createContractInstance = (abi, addressContract) => {
  return new web3.eth.Contract(abi, addressContract);
};

export const tokenERC20 = () =>
  createContractInstance(TokenERC20Artifact.abi, ContractAddress.MyTokenERC20);

export const nftERC721 = () =>
  createContractInstance(NftERC721Artifact.abi, ContractAddress.MyTokenERC721);

export const logic = () =>
  createContractInstance(LogicContractArtifact.abi, ContractAddress.Logic);

export const addressContract = {
  contractERC20: ContractAddress.MyTokenERC20,
  contractERC721: ContractAddress.MyTokenERC721,
  contractLogic: ContractAddress.Logic,
};
