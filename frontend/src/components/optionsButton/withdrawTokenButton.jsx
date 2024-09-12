import { Button, notification, Spin } from "antd";
import { useState } from "react";
import { PropTypes } from "prop-types";
import { logic } from "../../services/callDataFromContract";

const WithdrawTokenButton = ({ account }) => {
  const [loading, setLoading] = useState(false);

  const checkLockStatus = async () => {
    try {
      const deposit = await logic().methods.users(account).call();
      const currentTime = Math.floor(Date.now() / 1000);
      const lockTime = parseInt(deposit.depositTime) + 5 * 60; // Thời gian khóa là 5 phút (300 giây)
      return currentTime < lockTime; // return true => isLockTime
    } catch (error) {
      console.error("Error checking lock status:", error);
      notification.error({
        message: "Error",
        description: "Failed to check lock status. Please try again later.",
      });
      return false;
    }
  };

  const handleWithdrawToken = async () => {
    setLoading(true);
    try {
      const isLocked = await checkLockStatus();
      if (isLocked) {
        notification.warning({
          message: "Token Locked",
          description:
            "You cannot withdraw your tokens during the lock period.",
        });
        setLoading(false);
        return;
      }

      // withdraw function
      await logic().methods.withdraw().send({ from: account, gas: 5000000 });

      notification.success({
        message: "Success",
        description: "Your tokens have been successfully withdrawn.",
      });
    } catch (error) {
      console.error("Withdrawal failed:", error);
      notification.error({
        message: "Withdrawal Failed",
        description:
          "There was an error withdrawing your tokens. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleWithdrawToken} loading={loading} disabled={loading}>
      {loading ? <Spin size="small" /> : "WITHDRAW TOKENS"}
    </Button>
  );
};

WithdrawTokenButton.propTypes = {
  account: PropTypes.string.isRequired,
};

export default WithdrawTokenButton;
