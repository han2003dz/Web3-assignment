import {
  Button,
  Col,
  ConfigProvider,
  notification,
  Row,
  Select,
  Space,
} from "antd";
import { css } from "@emotion/css";
import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  addressContract,
  logic,
  nftERC721,
} from "../../services/callDataFromContract";

const labelRender = (props) => {
  const { label } = props;
  if (label) return label;
  return <span>No data</span>;
};

const StakedNFTs = ({ account }) => {
  const [balanceNFT721, setBalanceNFT721] = useState("0");
  const [symbolNFT, setSymbolNFT] = useState("MTE721");
  const [tokenIds, setTokenIds] = useState([]);
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const linearGradientButton = css`
    &.${rootPrefixCls}-btn-primary:not([disabled]):not(
        .${rootPrefixCls}-btn-dangerous
      ) {
      border-width: 0;

      > span {
        position: relative;
      }

      &::before {
        content: "";
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `;

  useEffect(() => {
    const getData = async () => {
      try {
        const [symbol, balanceNFT, tokenIDNfts] = await Promise.all([
          nftERC721().methods.symbol().call(),
          nftERC721().methods.balanceOf(account).call(),
          nftERC721().methods.getOwnedTokenIds(account).call(),
        ]);

        console.log("tokenIDs", tokenIDNfts);

        setBalanceNFT721(balanceNFT.toString());
        setSymbolNFT(symbol);
        setTokenIds(tokenIDNfts);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getData();
  }, [account]);

  const handleDepositNFT = async () => {
    if (selectedTokenId === null) {
      notification.error({
        message: "Error",
        description: "Please select an NFT to deposit",
      });
      return;
    }
    try {
      const tokenId = selectedTokenId;
      await nftERC721()
        .methods.approve(addressContract.contractLogic, tokenId)
        .send({ from: account });
      await logic()
        .methods.depositNFT(tokenId)
        .send({ from: account, gas: 500000 });
      notification.success({
        message: "Deposited",
        description: "Deposit successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const options = [
    ...tokenIds.map((tokenId) => ({
      label: `NFT ID: ${tokenId}`,
      value: tokenId.toString(),
    })),
  ];

  const handleChange = (value) => {
    setSelectedTokenId(value);
    console.log(`Selected: ${value}`);
  };
  return (
    <>
      <Row>
        <Col>
          <div>
            Holding NFTs: {balanceNFT721} {symbolNFT}
          </div>
        </Col>
      </Row>
      <Row>
        <Col span="">
          <Select
            defaultValue=""
            onChange={handleChange}
            style={{ width: 200 }}
            options={options}
            placeholder="Choose a Token Id"
          />
        </Col>
        <Col>
          <ConfigProvider
            button={{
              className: linearGradientButton,
            }}
          >
            <Space>
              <Button type="primary" onClick={handleDepositNFT}>
                Deposit NFT
              </Button>
            </Space>
          </ConfigProvider>
        </Col>
      </Row>
    </>
  );
};

StakedNFTs.propTypes = {
  account: PropTypes.string.isRequired,
};

labelRender.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

export default StakedNFTs;
