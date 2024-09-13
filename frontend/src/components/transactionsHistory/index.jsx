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
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorter, setSorter] = useState({});
  const searchInput = useRef(null);

  // Function to fetch data with pagination, filters, and sorting
  const fetchData = useCallback(
    async (page = 1, pageSize = 10, sorter = {}, filters = {}) => {
      setLoading(true);
      try {
        const sortQuery = sorter.order
          ? `${sorter.field}:${sorter.order === "ascend" ? "asc" : "desc"}`
          : undefined;
        const transactionQuery = {
          page,
          limit: pageSize,
          sortBy: sortQuery,
          ...filters,
        };

        const response = await getTransactions(transactionQuery);
        console.log("transactions", response);

        if (Array.isArray(response.results)) {
          setData(response.results);
          setPagination({
            current: page,
            pageSize,
            total: response.totalResults, // Tổng số kết quả từ API
          });
        } else {
          console.error("Expected an array but got:", response.results);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize, sorter);
  }, [fetchData, pagination.current, pagination.pageSize, sorter]);

  const handleTableChange = (newPagination, filters, newSorter) => {
    const { current, pageSize } = newPagination;

    console.log("newPagination", newPagination, "newSorter", newSorter);

    // Cập nhật lại pagination và sorter
    setPagination({
      current,
      pageSize,
      total: pagination.total,
    });

    setSorter({
      field: newSorter.field,
      order: newSorter.order,
    });

    // Gọi lại API để lấy dữ liệu trang mới với các bộ lọc và sắp xếp mới
    fetchData(current, pageSize, newSorter, filters);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    fetchData(pagination.current, pagination.pageSize, sorter, {
      [dataIndex]: selectedKeys[0],
    });
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
    fetchData(pagination.current, pagination.pageSize, sorter);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
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
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
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
      sorter: true,
      ...getColumnSearchProps("blockNumber"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "10%",
      sorter: true,
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
      sorter: true,
      sortDirections: ["descend", "ascend"],
      ellipsis: true,
    },
    {
      title: "To",
      dataIndex: "contractAddress",
      key: "contractAddress",
      width: "20%",
      ...getColumnSearchProps("contractAddress"),
      sorter: true,
      sortDirections: ["descend", "ascend"],
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "10%",
      ...getColumnSearchProps("amount"),
      sorter: true,
      render: (amount) => convertFromWeiToEth(amount),
      ellipsis: true,
    },
    {
      title: "gasPrice",
      dataIndex: "gasPrice",
      key: "gasPrice",
      width: "10%",
      sorter: true,
    },
    {
      title: "gasUsed",
      dataIndex: "gasUsed",
      key: "gasUsed",
      width: "10%",
      sorter: true,
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
      onChange={handleTableChange}
      rowKey="id"
    />
  );
};

export default TransactionsHistory;
