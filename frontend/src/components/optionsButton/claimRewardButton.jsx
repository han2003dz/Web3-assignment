import { Button, Spin, notification } from "antd";
import { useState } from "react";
import { logic } from "../../services/callDataFromContract";
import PropTypes from "prop-types";

const ClaimRewardButton = ({ account }) => {
  const [loading, setLoading] = useState(false);

  const checkLockStatus = async () => {
    try {
      const users = await logic().methods.users(account).call();
      const currentTime = Math.floor(Date.now() / 1000);
      const lockTime = users.depositTime + 5 * 60;
      return currentTime < lockTime;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleClaimReward = async () => {
    setLoading(true);
    try {
      if (await checkLockStatus()) {
        notification.warning({
          message: "Claim Locked",
          description: "You cannot claim your reward during the lock period.",
        });
        return; 
      }
      await logic().methods.claimReward().send({ from: account });
      notification.success({
        message: "Reward Claimed",
        description: "Your reward has been successfully claimed.",
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Claim Failed",
        description:
          "There was an error claiming your reward. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClaimReward} loading={loading} disabled={loading}>
      {loading ? <Spin size="small" /> : "CLAIM REWARD"}
    </Button>
  );
};

ClaimRewardButton.propTypes = {
  account: PropTypes.string.isRequired,
};

export default ClaimRewardButton;
