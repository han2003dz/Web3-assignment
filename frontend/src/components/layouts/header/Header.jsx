import { Layout, Menu } from "antd";
import { SketchOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import SignIn from "../../buttonSignIn";
import useUserStore from "../../../store/useUserStore";

const { Header } = Layout;
const headerStyle = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "white",
  borderBottom: "1px solid #ddd",
};
const HeaderLayout = () => {
  const { isLogin } = useUserStore();

  const items = [
    {
      key: "0",
      label: (
        <SketchOutlined
          style={{
            fontSize: "2rem",
            color: "blue",
          }}
        />
      ),
    },
    {
      key: "1",
      label: <NavLink to={`/`}>Home</NavLink>,
      style: {
        fontSize: "1rem",
      },
    },
    {
      key: "2",
      label: <NavLink to={`/history-transactions`}>Transactions</NavLink>,
      style: {
        fontSize: "1rem",
      },
    },
    {
      key: "4",
      label: <SignIn isLogin={isLogin} />,
      style: {
        marginLeft: "auto",
      },
      onClick: () => {
        console.log("Connect Wallet clicked");
      },
    },
  ];
  return (
    <Header style={headerStyle}>
      <div className="demo-logo" />
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["1"]}
        items={items}
        style={{
          flex: 1,
          minWidth: 0,
          borderBottom: "none",
          display: "flex",
          alignItems: "center",
        }}
      />
    </Header>
  );
};

export default HeaderLayout;
