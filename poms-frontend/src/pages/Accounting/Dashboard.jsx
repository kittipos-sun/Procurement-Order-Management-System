import React, { useState } from "react";
import {
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const AccountingDashboard = () => {
  // ข้อมูลตัวอย่าง
  const data = {
    employees: [
      {
        id: 1,
        name: "สมชาย เงินดี",
        position: "Accountant",
        salary: 45000,
        email: "somchai@example.com",
      },
      {
        id: 2,
        name: "สายฝน คำนวณเร็ว",
        position: "Senior Accountant",
        salary: 60000,
        email: "saifon@example.com",
      },
    ],
    transactions: [
      {
        transaction_id: "T001",
        date: "2025-04-01",
        amount: 50000,
        type: "income",
        description: "ชำระเงินจากลูกค้า A",
      },
      {
        transaction_id: "T002",
        date: "2025-04-02",
        amount: 30000,
        type: "expense",
        description: "ค่าเช่าสำนักงาน",
      },
    ],
    company_budget: {
      year: 2025,
      departments: {
        accounting: {
          allocated_budget: 500000,
          used_budget: 350000,
          remaining_budget: 150000,
        },
        marketing: {
          allocated_budget: 700000,
          used_budget: 500000,
          remaining_budget: 200000,
        },
      },
      total_budget: 2700000,
      total_used: 1950000,
      total_remaining: 750000,
    },
    orders: [
      {
        id: 1,
        code: "JC-0001",
        name: "คอมพิวเตอร์ ผู้มี 8 SAMSUNG ที่ตีเปิด/จัด",
        price: 258.0,
        quantity: 1,
        unit: "เครื่อง",
        status: "รอสินค้า",
      },
      {
        id: 2,
        code: "JC-0003",
        name: "เครื่อง SCAN สายค่าเมือง",
        price: 400.0,
        quantity: 1,
        unit: "เครื่อง",
        status: "รอสินค้า",
      },
    ],
  };

  // State สำหรับการจัดการทั้งหมด
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showPOViewer, setShowPOViewer] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    documentNumber: "PO-2025-001",
    documentDate: "2025-04-04",
    quoteReference: "",
    deliveryDate: "2025-04-15",
    originalDays: "7",
    shippingAddress: "607 ซอยรายอินทรา 8 ถนนรายอินทรา แขวงอนุสาวรีย์ เขตบางเขน กทม 10220",
    productCode: "JC-0001",
    productName: "คอมพิวเตอร์ ผู้มี 8 SAMSUNG ที่ตีเปิด/จัด",
    quantity: 1,
    unit: "เครื่อง",
    price: 258.0,
    discount: 0,
    notes: "",
    senderName: "สมชาย เงินดี",
    approveDate: "2025-04-04",
    receiver1Name: "",
    receiveDate1: "",
  });

  // State สำหรับ Payment Tracking
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [purchaseRequests, setPurchaseRequests] = useState(data.orders);
  const [payments, setPayments] = useState([
    {
      id: "INV-1001",
      amount: 50000,
      paidAmount: 0,
      dueDate: "2025-05-15",
      status: "รอชำระเงิน",
      slipUrl: null
    },
    {
      id: "INV-1002",
      amount: 75000,
      paidAmount: 0,
      dueDate: "2025-04-30",
      status: "รอชำระเงิน",
      slipUrl: null
    },
  ]);

  // State สำหรับ Financial Reporting
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState("monthly");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // ตัวอย่างข้อมูลรายงาน
  const sampleReportData = {
    monthly: {
      income: 1500000,
      expense: 950000,
      profit: 550000,
      transactions: [
        { category: "ยอดขาย", amount: 1200000 },
        { category: "ค่าเช่า", amount: 200000 },
        { category: "เงินเดือน", amount: 500000 },
        { category: "ค่าสาธารณูปโภค", amount: 150000 },
        { category: "อื่นๆ", amount: 100000 },
      ],
    },
    yearly: {
      income: 18000000,
      expense: 12000000,
      profit: 6000000,
      transactions: [
        { category: "ยอดขาย", amount: 15000000 },
        { category: "ค่าเช่า", amount: 2400000 },
        { category: "เงินเดือน", amount: 6000000 },
        { category: "ค่าสาธารณูปโภค", amount: 1800000 },
        { category: "อื่นๆ", amount: 1200000 },
      ],
    },
  };

  // Radial chart data
  const budgetPercentage =
    (data.company_budget.total_used / data.company_budget.total_budget) * 100;
  const radialData = [
    {
      name: "Budget Used",
      value: budgetPercentage,
      fill: "#3b82f6",
    },
  ];

  // Department budget data for bar chart
  const departmentData = Object.entries(data.company_budget.departments).map(
    ([dept, values]) => ({
      name: dept,
      used: values.used_budget,
      remaining: values.remaining_budget,
    })
  );

  // Functions for purchase history
  const handleViewPO = (order) => {
    setSelectedOrder(order);
    setShowPOViewer(true);
    setFormData({
      ...formData,
      productCode: order.code,
      productName: order.name,
      quantity: order.quantity,
      unit: order.unit,
      price: order.price,
    });
  };

  const handleClosePOViewer = () => {
    setShowPOViewer(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setShowPOViewer(false);
  };

  const handleApprove = (request) => {
    const updatedRequests = purchaseRequests.map(req => 
      req.id === request.id 
        ? { ...req, status: "อนุมัติแล้ว" } 
        : req
    );
    setPurchaseRequests(updatedRequests);
    alert(`อนุมัติใบขอซื้อ ${request.code} เรียบร้อยแล้ว`);
  };

  const handleReject = (request) => {
    const updatedRequests = purchaseRequests.map(req => 
      req.id === request.id 
        ? { ...req, status: "ปฏิเสธแล้ว" } 
        : req
    );
    setPurchaseRequests(updatedRequests);
    alert(`ปฏิเสธใบขอซื้อ ${request.code} เรียบร้อยแล้ว`);
  };

  // Functions for payment tracking
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPayment = (payment) => {
    setSelectedPayment(payment);
    setShowUploadModal(true);
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      alert("กรุณาเลือกไฟล์สลิปการโอนเงิน");
      return;
    }
    
    // อัปเดตสถานะการชำระเงิน
    const updatedPayments = payments.map(p => 
      p.id === selectedPayment.id 
        ? { 
            ...p, 
            status: "ชำระแล้ว", 
            paidAmount: p.amount,
            slipUrl: previewImage
          } 
        : p
    );
    
    setPayments(updatedPayments);
    alert(`อัปโหลดสลิปการชำระเงินสำหรับ ${selectedPayment.id} เรียบร้อยแล้ว`);
    setShowUploadModal(false);
    setUploadedFile(null);
    setPreviewImage(null);
    setSelectedPayment(null);
  };

  // Functions for slip viewing
  const handleViewSlip = (payment) => {
    setSelectedSlip(payment);
    setShowSlipModal(true);
  };

  const handleCloseSlipModal = () => {
    setShowSlipModal(false);
    setSelectedSlip(null);
  };

  // Functions for financial reporting
  const generateReport = () => {
    if (!selectedMonth && reportType === "monthly") {
      alert("กรุณาเลือกเดือนก่อนสร้างรายงาน");
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      setReportData(sampleReportData[reportType]);
      setIsGenerating(false);
    }, 1500);
  };

  // Button style constants for consistency
  const buttonPrimary = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200";
  const buttonSecondary = "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200";
  const buttonSuccess = "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200";
  const buttonSmall = "text-sm py-1 px-3";

  return (
    <div className="grid grid-cols-1 gap-6 p-4">
      {/* 1. Budget Status Dashboard */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">สถานะงบประมาณบริษัท</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Radial Chart */}
          <div className="w-full md:w-1/3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  fill="#3b82f6"
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-lg font-bold"
                >
                  {`${budgetPercentage.toFixed(1)}%`}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Details */}
          <div className="w-full md:w-2/3">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>ใช้งบประมาณไปแล้ว</span>
                <span>฿{data.company_budget.total_used?.toLocaleString() || '0'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">งบประมาณทั้งหมด</p>
                <p className="text-xl font-bold">
                  ฿{data.company_budget.total_budget?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">ใช้งบไปแล้ว</p>
                <p className="text-xl font-bold text-blue-600">
                  ฿{data.company_budget.total_used?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">คงเหลือ</p>
                <p className="text-xl font-bold text-green-600">
                  ฿{data.company_budget.total_remaining?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Purchase History Section */}
      <div className="w-full bg-white border border-gray-300 shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">รายการใบขอซื้อ</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2">รหัส</th>
                <th className="px-4 py-2">ชื่อสินค้า</th>
                <th className="px-4 py-2">ราคา</th>
                <th className="px-4 py-2">จำนวน</th>
                <th className="px-4 py-2">หน่วย</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {purchaseRequests.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{order.code}</td>
                  <td className="px-4 py-2">{order.name}</td>
                  <td className="px-4 py-2">{order.price?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-2">{order.quantity}</td>
                  <td className="px-4 py-2">{order.unit}</td>
                  <td className="px-4 py-2 font-semibold">
                    <span className={
                      order.status === "อนุมัติแล้ว" ? "text-green-600" :
                      order.status === "ปฏิเสธแล้ว" ? "text-red-600" :
                      "text-orange-500"
                    }>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleViewPO(order)}
                      className={`${buttonPrimary} ${buttonSmall}`}
                    >
                      ดูใบPR
                    </button>
                    {order.status === "รอสินค้า" && (
                      <>
                        <button
                          onClick={() => handleApprove(order)}
                          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-200`}
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleReject(order)}
                          className={`bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-200`}
                        >
                          ปฏิเสธ
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
              
      {/* PO Viewer Modal - ฟอร์มเดิมที่คุณต้องการให้คงไว้ */}
      {showPOViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitForm}>
              <div className="mb-6">
                <div className="text-center font-bold text-xl mb-2">บริษัท โปรซอฟท์ ซีอาร์เอ็ม จํากัด</div>
                <div className="text-center text-sm mb-4">
                  287 หมู่ 5 ตําบลสันทรายน้อย อําเภอสันทราย จังหวัดเชียงใหม่ 50210<br />
                  โทร 02-402-8068, 081-359-7689<br />
                  อีเมล์ sale@prosoftbbiz.com เลขประจําตัวผู้เสียภาษี 0505557001854
                </div>
                
                <div className="text-center font-bold text-lg mb-4">ใบสั่งซื้อ / Purchase Order</div>
                
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="font-bold mb-1">ผู้ติดต่อ:</div>
                    <div className="mb-1">บริษัท: บริษัท นันทนาอินฟอร์มครึ่งเซิลเตมิ้</div>
                    <div className="mb-1">ที่อยู่: 607 ซอยรายอินทรา 8 ถนนรายอินทรา แขวงอนุสาวรีย์ เขตบางเขน กทม 10220</div>
                    <div className="mb-1">โทร: 08-9108-2070</div>
                    <div className="mb-1">เลขประจําตัวผู้เสียภาษีอากร: 2581251421512</div>
                  </div>
                  
                  <div className="border border-gray-300 p-3 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm">เลขที่เอกสาร <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="documentNumber"
                          value={formData.documentNumber}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm">วันที่เอกสาร <span className="text-red-500">*</span></label>
                        <input 
                          type="date" 
                          name="documentDate"
                          value={formData.documentDate}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm">อ้างอิงในเสนอราคา</label>
                        <input 
                          type="text" 
                          name="quoteReference"
                          value={formData.quoteReference}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-sm">วันที่กำหนดส่ง</label>
                        <input 
                          type="date" 
                          name="deliveryDate"
                          value={formData.deliveryDate}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-sm">จำนวนวันแรกเดิม</label>
                        <input 
                          type="text" 
                          name="originalDays"
                          value={formData.originalDays}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm">ที่อยู่จัดส่ง</label>
                        <input 
                          type="text" 
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ตารางรายการสินค้า */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="border p-2">ลำดับ</th>
                      <th className="border p-2">รหัสสินค้า <span className="text-red-500">*</span></th>
                      <th className="border p-2">รายการ <span className="text-red-500">*</span></th>
                      <th className="border p-2">จำนวน <span className="text-red-500">*</span></th>
                      <th className="border p-2">หน่วย <span className="text-red-500">*</span></th>
                      <th className="border p-2">ราคา/หน่วย <span className="text-red-500">*</span></th>
                      <th className="border p-2">ส่วนลด</th>
                      <th className="border p-2">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">1</td>
                      <td className="border p-2">
                        <input 
                          type="text" 
                          name="productCode"
                          value={formData.productCode}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </td>
                      <td className="border p-2">
                        <input 
                          type="text" 
                          name="productName"
                          value={formData.productName}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </td>
                      <td className="border p-2">
                        <input 
                          type="number" 
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                          min="1"
                          required
                        />
                      </td>
                      <td className="border p-2">
                        <input 
                          type="text" 
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </td>
                      <td className="border p-2">
                        <input 
                          type="number" 
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                          step="0.01"
                          min="0"
                          required
                        />
                      </td>
                      <td className="border p-2">
                        <input 
                          type="number" 
                          name="discount"
                          value={formData.discount}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="border p-2">
                        <input 
                          type="number" 
                          name="totalAmount"
                          value={(formData.price * formData.quantity - formData.discount).toFixed(2)}
                          className="w-full p-1 border border-gray-300 rounded"
                          readOnly
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ส่วนสรุปยอด */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="3"
                  ></textarea>
                </div>
                <div>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="border p-2 font-medium">รวมเป็นเงิน</td>
                        <td className="border p-2 text-right">{(formData.price * formData.quantity).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">หักส่วนลด</td>
                        <td className="border p-2 text-right">{formData.discount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">ยอดหลังหักส่วนลด</td>
                        <td className="border p-2 text-right">{(formData.price * formData.quantity - formData.discount).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">จำนวนภาษีมูลค่าเพิ่ม 7%</td>
                        <td className="border p-2 text-right">{((formData.price * formData.quantity - formData.discount) * 0.07).toFixed(2)}</td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td className="border p-2 font-bold">จำนวนเงินรวมทั้งสิ้น</td>
                        <td className="border p-2 text-right font-bold">
                          {((formData.price * formData.quantity - formData.discount) * 1.07).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ส่วนท้ายฟอร์ม */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
                <div className="text-center">
                  <div className="mb-1">ผู้สั่งซื้อสินค้า</div>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleInputChange}
                    placeholder="(ลงชื่อ)"
                    className="w-full p-1 border border-gray-300 rounded text-center"
                    required
                  />
                  <div className="text-sm">ตำแหน่ง</div>
                  <input 
                    type="date" 
                    name="approveDate"
                    value={formData.approveDate}
                    onChange={handleInputChange}
                    className="w-full p-1 border border-gray-300 rounded mt-1"
                    required
                  />
                </div>
                <div className="text-center">
                  <div className="mb-1">ผู้รับใบสั่งซื้อ</div>
                  <input
                    type="text"
                    name="receiver1Name"
                    value={formData.receiver1Name}
                    onChange={handleInputChange}
                    placeholder="(ลงชื่อ)"
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                  <div className="text-sm">ตำแหน่ง</div>
                  <input 
                    type="date" 
                    name="receiveDate1"
                    value={formData.receiveDate1}
                    onChange={handleInputChange}
                    className="w-full p-1 border border-gray-300 rounded mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleClosePOViewer}
                  className={buttonSecondary}
                >
                  ปิด
                </button>
                <button
                  type="submit"
                  className={buttonSuccess}
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Payment Tracking Section */}
      <div className="w-full bg-white border border-gray-300 shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">รายการการชำระเงิน</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2">เลขที่ใบแจ้งหนี้</th>
                <th className="px-4 py-2">จำนวนเงิน</th>
                <th className="px-4 py-2">ชำระแล้ว</th>
                <th className="px-4 py-2">วันที่ครบกำหนด</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{payment.id}</td>
                  <td className="px-4 py-2">{payment.amount?.toLocaleString() || '0'}</td>
                  <td className="px-4 py-2">{payment.paidAmount?.toLocaleString() || '0'}</td>
                  <td className="px-4 py-2">{payment.dueDate}</td>
                  <td className={`px-4 py-2 font-semibold ${
                    payment.status === "ชำระแล้ว" ? "text-green-600" : "text-orange-500"
                  }`}>
                    {payment.status}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {payment.status === "ชำระแล้ว" ? (
                      <button
                        onClick={() => handleViewSlip(payment)}
                        className={`${buttonPrimary} ${buttonSmall}`}
                      >
                        ดูใบสลิป
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUploadPayment(payment)}
                        className={`${buttonPrimary} ${buttonSmall}`}
                      >
                        อัปหลักฐานโอนเงิน
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Payment Proof Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">อัปโหลดหลักฐานการชำระเงิน {selectedPayment?.id}</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedFile(null);
                  setPreviewImage(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitPayment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกไฟล์สลิปการโอนเงิน
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
              </div>
              
              {previewImage && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ตัวอย่างภาพสลิป
                  </label>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-h-64 border rounded mx-auto"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFile(null);
                    setPreviewImage(null);
                  }}
                  className={buttonSecondary}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={buttonSuccess}
                >
                  ยืนยันการอัปโหลด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slip Viewer Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">ใบสลิปการชำระเงิน {selectedSlip?.id}</h3>
              <button
                onClick={handleCloseSlipModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="border rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">เลขที่ใบแจ้งหนี้</p>
                  <p className="font-medium">{selectedSlip?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">วันที่ชำระ</p>
                  <p className="font-medium">{selectedSlip?.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">จำนวนเงิน</p>
                  <p className="font-medium">{selectedSlip?.amount?.toLocaleString() || '0'} บาท</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">สถานะ</p>
                  <p className="font-medium text-green-600">{selectedSlip?.status}</p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">ตัวอย่างสลิปการโอน:</p>
                <div className="flex justify-center">
                  {selectedSlip?.slipUrl ? (
                    <img 
                      src={selectedSlip.slipUrl}
                      alt="สลิปการโอนเงิน"
                      className="max-h-64 border rounded"
                    />
                  ) : (
                    <div className="bg-gray-200 p-8 text-gray-500 rounded">
                      ไม่มีภาพสลิป
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => window.open(selectedSlip?.slipUrl, '_blank')}
                className={`${buttonPrimary} flex items-center`}
                disabled={!selectedSlip?.slipUrl}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                เปิดสลิปในแท็บใหม่
              </button>
              <button
                onClick={handleCloseSlipModal}
                className={buttonSecondary}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Financial Reporting Section */}
      <div className="w-full bg-white border border-gray-300 shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">สร้างรายงานทางการเงิน</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทรายงาน</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">รายงานประจำเดือน</option>
              <option value="yearly">รายงานประจำปี</option>
            </select>
          </div>

          {reportType === "monthly" && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">เลือกเดือน</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เลือกเดือน</option>
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={generateReport}
          disabled={isGenerating}
          className={`${buttonPrimary} flex items-center`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังสร้างรายงาน...
            </>
          ) : (
            "สร้างรายงาน"
          )}
        </button>

        {reportData && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              รายงาน{reportType === "monthly" ? "ประจำเดือน" : "ประจำปี"} {reportType === "monthly" && selectedMonth}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">รายได้ทั้งหมด</p>
                <p className="text-2xl font-bold">฿{reportData.income?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">ค่าใช้จ่ายทั้งหมด</p>
                <p className="text-2xl font-bold">฿{reportData.expense?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">กำไรสุทธิ</p>
                <p className="text-2xl font-bold">฿{reportData.profit?.toLocaleString() || '0'}</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData.transactions}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    name="จำนวนเงิน (บาท)" 
                    fill="#8884d8" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  console.log("Exporting report...");
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                ส่งออกเป็น PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountingDashboard;