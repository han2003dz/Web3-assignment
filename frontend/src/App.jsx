import { BrowserRouter as Router } from "react-router-dom";
import AllRouter from "./routers/useRouter";
import { useEffect, useState } from "react";
import { login, refresh, verify } from "./services/auth";
import useUserStore from "./store/useUserStore";
import Web3 from "web3";
import { jwtDecode } from "jwt-decode";
import { getCookie } from "./services/cookies";

function App() {
  const { setIsLogin, setUser, user } = useUserStore();
  const [error, setError] = useState("");
  const [web3, setWeb3] = useState(null);
  console.log("web3", web3);

  const handleSignMessage = async (message, account) => {
    try {
      const signature = await web3.eth.personal.sign(message, account, "");
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  };
  const handleLogin = async () => {
    const loginResponse = await login(user);
    const message = `Nonce:${loginResponse.nonce}`;
    const signature = await handleSignMessage(message, user);
    const verifyResponse = await verify(user, signature);
    const { accessToken } = verifyResponse;

    const userInfo = jwtDecode(accessToken);
    setUser(userInfo.publicAddress);
  };
  // Hàm để khởi tạo MetaMask
  const initializeMetamask = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        setError("MetaMask is not installed.");
        return;
      }

      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const currentChainId = await web3Instance.eth.getChainId();
      const targetChainId = 0x61; // BSC Testnet chainId

      if (currentChainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x61" }],
          });
          alert("Switched to Binance Smart Chain Testnet");
        } catch (switchError) {
          if (switchError.code === 4001) {
            setError("User rejected the chain switch request.");
          } else {
            setError("Failed to switch chain.");
          }
          return;
        }
      }

      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length === 0) {
        setError("No accounts found. Please connect MetaMask.");
        return;
      }

      const publicAddress = accounts[0];
      console.log("publicAddress", publicAddress);
      setUser(publicAddress);
    } catch (error) {
      console.log("error", error);
      setError("An error occurred while connecting to MetaMask.");
    }
  };

  // useEffect để gọi MetaMask khi khởi tạo
  useEffect(() => {
    initializeMetamask();
  }, [setUser]);

  useEffect(() => {
    console.log("OKKkkk");
    const onRefresh = async () => {
      try {
        const response = await refresh();
        const token = getCookie("accessToken");
        console.log("token", token);
        if (!token) {
          setIsLogin(false);
          handleLogin();
        }
        setIsLogin(true);
        console.log("response", response);
      } catch (error) {
        console.log("error", error);
        setError("Failed to refresh session");
        handleLogin();
      }
    };
    if (user) onRefresh();
  }, [user]);

  return (
    <>
      <Router>
        <AllRouter />
      </Router>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </>
  );
}

export default App;
