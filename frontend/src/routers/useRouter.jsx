import { useRoutes } from "react-router-dom";
import { routers } from "./index";
const AllRouter = () => {
  const elements = useRoutes(routers);
  return <>{elements}</>;
};

export default AllRouter;
