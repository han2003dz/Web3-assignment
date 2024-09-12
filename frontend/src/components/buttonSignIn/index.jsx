import Web3 from "web3";
import { login, verify } from "../../services/auth";
import { Button, Dropdown, Flex, Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { formatAddress } from "../../utils/formatAddress";
import { DownOutlined, LoginOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import { PropTypes } from "prop-types";
import useUserStore from "../../store/useUserStore";

const web3 = new Web3(window.ethereum);

const SignIn = ({ isLogin }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUserStore();

  console.log("isLogin", isLogin);
  console.log("user", user);

  const handleSignMessage = async (message, account) => {
    try {
      const signature = await web3.eth.personal.sign(message, account, "");
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const loginResponse = await login(user);
      const message = `Nonce:${loginResponse.nonce}`;
      const signature = await handleSignMessage(message, user);
      const verifyResponse = await verify(user, signature);
      const { accessToken } = verifyResponse;

      const userInfo = jwtDecode(accessToken);
      setUser(userInfo.publicAddress);
    } catch (err) {
      console.error("Error in handleSignIn:", err);
      setError(err.response?.data?.message || "Error during sign-in");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setUser(accounts[0]);
        } else {
          setUser(null);
          setError("Disconnected from MetaMask.");
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [setUser]);
  const items = [
    {
      label: "Disconnect",
      key: "1",
    },
  ];

  return (
    <Flex justify="center" align="center" direction="column">
      {user ? (
        <>
          <Space>
            <Dropdown.Button icon={<DownOutlined />} menu={{ items }}>
              Connected: {formatAddress(user)}
            </Dropdown.Button>
          </Space>
        </>
      ) : (
        <Button type="primary" onClick={handleSignIn} disabled={loading}>
          {loading ? <Spin /> : <LoginOutlined />} Sign In with MetaMask
        </Button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </Flex>
  );
};

SignIn.propTypes = {
  isLogin: PropTypes.bool.isRequired,
};

export default SignIn;
