import LayoutDefault from "../components/layouts/LayoutDefault";
import Main from "../components/layouts/main/Main";
import TransactionsHistory from "../components/transactionsHistory";

export const routers = [
  {
    path: "",
    element: <LayoutDefault />,
    children: [
      {
        path: "",
        element: <Main />,
      },
      {
        path: "history-transactions",
        element: <TransactionsHistory />,
      },
    ],
  },
];
