import { useCallback, useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag } from "antd";
import Highlighter from "react-highlight-words";
import { getTransactions } from "./../../services/transactions";
import { formatDateTime } from "../../utils/formatDate";
import { convertFromWeiToEth } from "../../utils/convertAmount";

const TransactionsHistory = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const searchInput = useRef(null);

  // Function to fetch data with pagination
  const fetchData = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getTransactions({ page, limit: pageSize });
      console.log("transactions", response);

      if (Array.isArray(response.results)) {
        setData(response.results);
        setPagination({
          current: page,
          pageSize,
          total: response.totalResults,
        });
      } else {
        console.error("Expected an array but got:", response.results);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, [fetchData, pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Transaction Hash",
      dataIndex: "transactionHash",
      key: "transactionHash",
      ellipsis: true,
      ...getColumnSearchProps("transactionHash"),
    },
    {
      title: "Method",
      dataIndex: "eventName",
      width: "10%",
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Block",
      dataIndex: "blockNumber",
      width: "10%",
      sorter: (a, b) => a.blockNumber - b.blockNumber,
      ...getColumnSearchProps("transactionHash"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "10%",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortDirections: ["descend", "ascend"],
      ...getColumnSearchProps("createdAt"),
      render: (time) => formatDateTime(time),
    },
    {
      title: "From",
      dataIndex: "spender",
      key: "spender",
      width: "20%",
      ...getColumnSearchProps("spender"),
      sorter: (a, b) => a.spender.localeCompare(b.spender),
      sortDirections: ["descend", "ascend"],
      ellipsis: true,
    },
    {
      title: "To",
      dataIndex: "contractAddress",
      key: "contractAddress",
      width: "20%",
      ...getColumnSearchProps("contractAddress"),
      sorter: (a, b) => a.contractAddress.localeCompare(b.contractAddress),
      sortDirections: ["descend", "ascend"],
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "10%",
      ...getColumnSearchProps("amount"),
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => convertFromWeiToEth(amount),
      ellipsis: true,
    },
    {
      title: "Txn Fee",
      dataIndex: "txnFee",
      key: "txnFee",
      width: "10%",
      sorter: (a, b) => a.txnFee - b.txnFee,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: handleTableChange,
      }}
      rowKey="id"
    />
  );
};

export default TransactionsHistory;
