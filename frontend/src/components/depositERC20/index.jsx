import { useCallback, useEffect, useState } from "react";
import { Button, Input, notification, Row, Space } from "antd";
import { PropTypes } from "prop-types";
import {
  addressContract,
  logic,
  tokenERC20,
} from "../../services/callDataFromContract";
import {
  convertFromEthToWei,
  convertFromWeiToEth,
} from "../../utils/convertAmount";

const Deposit = ({ account }) => {
  const [amount, setAmount] = useState("");
  const [symbol, setSymbol] = useState("MTERC20");
  const [holdingERC20, setHoldingERC20] = useState(0);

  const updateBalanceERC20 = useCallback(async () => {
    try {
      const [balance, _symbol] = await Promise.all([
        tokenERC20().methods.balanceOf(account).call(),
        tokenERC20().methods.symbol().call(),
      ]);
      setHoldingERC20(convertFromWeiToEth(balance));
      setSymbol(_symbol);
    } catch (error) {
      console.log("Lỗi khi lấy số dư ERC20:", error);
    }
  }, [account]);

  const deposit = async () => {
    const weiAmount = convertFromEthToWei(amount);
    try {
      await tokenERC20()
        .methods.approve(addressContract.contractLogic, weiAmount)
        .send({ from: account });

      await logic().methods.deposit(weiAmount).send({ from: account });

      notification.success({
        message: "Deposit thành công!",
        description: `Bạn đã gửi ${amount} ${symbol} thành công!`,
      });

      updateBalanceERC20();
    } catch (error) {
      console.error("Lỗi khi deposit:", error);
      notification.error({
        message: "Deposit thất bại",
        description: "Đã xảy ra lỗi khi gửi token. Vui lòng thử lại.",
      });
    }
  };
  useEffect(() => {
    updateBalanceERC20();
  }, [account, updateBalanceERC20]);

  return (
    <>
      <Row>
        <p>
          Holding ERC20: {holdingERC20} {symbol}
        </p>
      </Row>
      <Space.Compact>
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Nhập số lượng token"
        />
        <Button type="primary" onClick={deposit}>
          Deposit ERC20
        </Button>
      </Space.Compact>
    </>
  );
};
Deposit.propTypes = {
  account: PropTypes.string.isRequired,
};
export default Deposit;
