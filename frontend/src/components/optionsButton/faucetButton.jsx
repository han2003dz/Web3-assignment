import { Button, notification } from "antd";
import PropTypes from "prop-types";
import { tokenERC20 } from "../../services/callDataFromContract";

const FaucetButton = ({ account }) => {
  const handleFaucet = async () => {
    try {
      await tokenERC20().methods.faucetERC20(account).send({ from: account });
      notification.success({
        message: "Faucet thành công!",
        description: "Token đã được gửi vào tài khoản của bạn.",
      });
    } catch (error) {
      console.error("Faucet failed", error);
      notification.error({
        message: "Faucet thất bại!",
        description: "Đã có lỗi xảy ra khi yêu cầu token.",
      });
    }
  };

  return (
    <>
      <Button onClick={handleFaucet}>FAUCET 1M TOKEN</Button>
    </>
  );
};

FaucetButton.propTypes = {
  account: PropTypes.string.isRequired,
};

export default FaucetButton;
