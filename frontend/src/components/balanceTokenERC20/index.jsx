import { useState, useEffect } from "react";
import { useStore } from "../../store/useStore";
import { tokenERC20 } from "../../services/callDataFromContract";
import { convertFromWeiToEth } from "../../utils/convertAmount";

const BalanceTokenERC20 = () => {
  const { account } = useStore((state) => ({
    account: state.account,
  }));
  const [balanceToken, setBalanceToken] = useState(0);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await tokenERC20().methods.balanceOf(account).call();
        setBalanceToken(convertFromWeiToEth(response));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getData();
  }, [account]);

  return <span>{balanceToken}</span>;
};

export default BalanceTokenERC20;
