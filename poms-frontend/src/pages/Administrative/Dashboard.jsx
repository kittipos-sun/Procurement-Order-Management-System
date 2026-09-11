import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [financialData, setFinancialData] = useState({
    income: 0,
    totalProfit: 0,
    expenses: 0,
    debt: 0,
  });
  const [orders, setOrders] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [financialRes, ordersRes] = await Promise.all([
          fetch("http://localhost:3000/api/finance/"),
          fetch("http://localhost:3000/api/purchase-orders/")
        ]);

        const { financialData, debts } = await financialRes.json();
        const ordersData = await ordersRes.json();

        setFinancialData(financialData);
        setOrders(ordersData);
        setDebts(debts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Total Items",
        data: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200],
        backgroundColor: "#3F2455",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Items Overview",
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Items'
        }
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-right font-bold text-gray-700">
          <p>{formattedDate}</p>
          <p>{formattedTime}</p>
        </div>
      </div>
      
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { title: "รายรับบริษัท", value: financialData.income },
          { title: "กำไรทั้งหมด", value: financialData.totalProfit },
          { title: "รายจ่ายบริษัท", value: financialData.expenses },
          { title: "หนี้ที่ต้องชำระเดือนนี้", value: financialData.debt }
        ].map((item, index) => (
          <div key={index} className="bg-gray-600 p-4 rounded-xl text-center text-white shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
            <p className="text-2xl font-bold">
              {item.value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Orders Section */}
        <div className="bg-white p-6 shadow-md rounded-xl h-80 overflow-y-auto lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">รายการสั่งซื้อ</h2>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">กำลังโหลด...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                  <span className="font-medium">{order.purchaseOrderId}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === "Pending" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debts Section */}
        <div className="bg-white p-6 rounded-xl shadow-md h-full lg:col-span-2 row-span-2 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">หนี้ที่ต้องชำระในเดือนนี้</h2>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">กำลังโหลด...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debts.map((debt) => (
                <div key={debt.id} className="p-3 border-b hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{debt.name}</span>
                    <span className="text-red-600 font-semibold">
                      {debt.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Due: {new Date(debt.dueDate).toLocaleDateString()}</span>
                    <span className={`${
                      debt.status === "Paid" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {debt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-3">
          <div className="h-64">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly Items Overview</h2>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
