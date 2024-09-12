import { Card, Col, Row } from "antd";
import Deposit from "../../depositERC20";
import OptionsButton from "../../optionsButton";
import StakedNFTs from "../../depositNFTs";
import StakingInformation from "../../stakingInformation";
import useUserStore from "../../../store/useUserStore";

const Main = () => {
  const { user } = useUserStore();
  console.log("user", user);
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Staking Information" bordered={false}>
            <StakingInformation account={user} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Actions" bordered={false}>
            <div style={{ marginBottom: "16px" }}>
              <Deposit account={user} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <StakedNFTs account={user} />
            </div>
            <div>
              <OptionsButton account={user} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Main;
