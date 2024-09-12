import { PropTypes } from "prop-types";
import { Flex } from "antd";
import FaucetButton from "./faucetButton";
import ClaimRewardButton from "./claimRewardButton";
import WithdrawTokenButton from "./withdrawTokenButton";

const OptionsButton = ({ account }) => {
  return (
    <>
      <Flex gap="small" className="site-button-ghost-wrapper">
        <WithdrawTokenButton account={account} />
        <ClaimRewardButton account={account} />
        <FaucetButton account={account} />
      </Flex>
    </>
  );
};

OptionsButton.propTypes = {
  account: PropTypes.string.isRequired,
};

export default OptionsButton;
