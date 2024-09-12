import { useState, useEffect } from "react";
import Web3 from "web3";
import TokenERC20Artifact from "../../contracts/MyTokenERC20.json";
import LogicContractArtifact from "../../contracts/Logic.json";
import ContractAddress from "../../contracts/contract-address.json";
import PropTypes from "prop-types";

const StakingInformation = ({ account }) => {
  const [stakedAmount, setStakedAmount] = useState("0");
  const [tokenSymbol, setTokenSymbol] = useState("MTERC20");
  const [remainingTime, setRemainingTime] = useState(0);
  const [interest, setInterest] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [stakedAmountNFT, setStakedAmountNFT] = useState(0);

  useEffect(() => {
    const web3 = new Web3(window.ethereum);
    const tokenERC20 = new web3.eth.Contract(
      TokenERC20Artifact.abi,
      ContractAddress.MyTokenERC20
    );
    const LogicContract = new web3.eth.Contract(
      LogicContractArtifact.abi,
      ContractAddress.Logic
    );

    const formatETH = (amount) => {
      return web3.utils.fromWei(amount, "ether");
    };

    const getData = async () => {
      try {
        console.log(
          "amount",
          await tokenERC20.methods.balanceOf(account).call()
        );

        const [symbol] = await Promise.all([
          tokenERC20.methods.symbol().call(),
        ]);

        const [
          getLockTime,
          getInterest,
          getDeposit,
          getInterestRate,
          getDepositedNFT,
        ] = await Promise.all([
          LogicContract.methods.LOCK_TIME().call(),
          LogicContract.methods.calculateInterest(account).call(),
          LogicContract.methods.getDepositAmount(account).call(),
          LogicContract.methods.getInterestRate(account).call(),
          LogicContract.methods.getDepositedNFTCount(account).call(),
        ]);

        console.log("get", getDepositedNFT);
        setTokenSymbol(symbol);
        setStakedAmount(formatETH(getDeposit));
        setRemainingTime(parseInt(getLockTime, 10));
        setInterest(formatETH(getInterest));
        setInterestRate(Number(getInterestRate));
        setStakedAmountNFT(Number(getDepositedNFT));

        console.log(getInterestRate);
        console.log(getDeposit);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getData();

    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [account]);

  const convertSecondsToHMS = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <>
      <h2>Staking Information</h2>
      <div>
        Staked Amount: {stakedAmount} {tokenSymbol}
      </div>
      <div>Staked NFTs: {stakedAmountNFT} </div>
      <div>Effective APR: {interestRate} %</div>
      <div>Calculated Reward: {interest}</div>
      <div>Lock time: {convertSecondsToHMS(remainingTime)}</div>
    </>
  );
};

StakingInformation.propTypes = {
  account: PropTypes.string.isRequired,
};

export default StakingInformation;
