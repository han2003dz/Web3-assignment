import { Layout } from "antd";
import Header from "./header/Header";
import { Outlet } from "react-router-dom";

const { Content } = Layout;
const LayoutDefault = () => {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Layout>
        <Content style={{ padding: "0 24px", minHeight: "calc(100vh - 64px)" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutDefault;
