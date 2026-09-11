import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const mockData = {
  purchaseRequests: [
    // {
    //   purchaseRequestId: "PR001",
    //   createdBy: "U001",
    //   createdAt: "2023-10-01T12:00:00Z",
    //   description: "ขอซื้อวัสดุสำนักงาน",
    //   status: "รออนุมัติ",
    //   totalPrice: 15000,
    //   requiredDate: "2023-10-15",
    //   items: [
    //     {
    //       itemId: "I001",
    //       description: "กระดาษ A4",
    //       unit: "รีม",
    //       unitPrice: 100,
    //       quantity: 50,
    //       totalItemPrice: 5000
    //     }
    //   ]
    // }
  ],
  budget: {
    total: 200000,
    used: 85000,
  },
  notifications: [
    {
      notificationId: "N001",
      userId: "U001",
      message: "คำขอซื้อ PR001 เกินงบประมาณที่กำหนด",
      priority: "high",
      createdAt: "2023-10-03T09:30:00Z",
    },
  ],
  monthlyStats: [
    { month: "Jan", total: 200 },
    { month: "Feb", total: 300 },
    { month: "Dec", total: 1500 },
  ],
};

const PurchasingDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [usedBudget, setUsedBudget] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { user } = useAuth();
  const nextPRId = `PR${String(orders.length + 1).padStart(3, "0")}`;

  const [formData, setFormData] = useState({
    company: "CSI206 Company",
    department: "",
    position: "",
    requesterName: "",
    phone: "",
    requiredDate: "",
    requestDate: new Date().toISOString().split("T")[0],
    requester: "",
    approver: "",
    purchasingOfficer: user?.display_name || "",
    approveDate: "",
    isApproved: false,
    items: [{}],
  });

  const toggleForm = () => setIsFormOpen(!isFormOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];

    if (name === "quantity" || name === "unitPrice") {
      newItems[index][name] = parseFloat(value) || 0;
    } else {
      newItems[index][name] = value;
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          unit: "",
          unitPrice: 0,
          remarks: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) {
      alert("ต้องมีรายการสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate items
      if (formData.items.length === 0) {
        throw new Error("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
      }

      for (const item of formData.items) {
        if (
          !item.description ||
          !item.unit ||
          item.quantity <= 0 ||
          item.unitPrice < 0
        ) {
          throw new Error("กรุณากรอกข้อมูลรายการสินค้าให้ครบถ้วนและถูกต้อง");
        }
      }

      const prData = {
        company: formData.company,
        department: formData.department,
        position: formData.position,
        requesterName: formData.requesterName,
        phone: formData.phone,
        requiredDate: formData.requiredDate,
        requestDate: formData.requestDate,
        purchasingOfficer: formData.purchasingOfficer,
        items: formData.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          remarks: item.remarks,
        })),
      };

      console.log("Sending data:", prData);

      const response = await fetch(
        "http://localhost:3000/api/purchase-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prData),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();

      console.log("API Response:", result);

      if (result.success) {
        alert("สร้างใบขอซื้อสำเร็จแล้ว!");
        setIsFormOpen(false);
        await fetchDashboardData();

        // Reset form
        setFormData({
          company: "บริษัท นันทนาอินฟอร์มครึ่งเซิลเตมิ้",
          department: "ฝ่ายไอที",
          position: "ผู้พัฒนาซอฟต์แวร์",
          requesterName: "สมชาย ใจดี",
          phone: "08-1234-5678",
          requiredDate: "",
          requestDate: new Date().toISOString().split("T")[0],
          requester: "สมชาย ใจดี",
          approver: "",
          purchasingOfficer: "นางสาวสมหญิง จัดซื้อ",
          approveDate: "",
          isApproved: false,
          items: [
            {
              description: "กระดาษ A4",
              quantity: 5,
              unit: "รีม",
              unitPrice: 120,
              remarks: "สำหรับพิมพ์เอกสารทั่วไป",
            },
          ],
        });
      } else {
        throw new Error(result.message || "เกิดข้อผิดพลาดในการสร้างใบขอซื้อ");
      }
    } catch (err) {
      console.error("Error creating PR:", err);
      setSubmitError(err.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setOrders(mockData.purchaseRequests);
      setTotalBudget(mockData.budget.total);
      setUsedBudget(mockData.budget.used);
      setNotifications(mockData.notifications);
      setChartData(mockData.monthlyStats);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-xl">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
        <button
          onClick={fetchDashboardData}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  const remainingBudget = totalBudget - usedBudget;

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <header className="text-2xl font-bold">ภาพรวมการจัดซื้อ</header>
          <button
            onClick={toggleForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            + สร้างใบขอซื้อ
          </button>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-[#42424290] flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    ใบขอซื้อ (Purchase Requisition)
                  </h2>
                  <button
                    onClick={toggleForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">
                        เลขที่ PR.No:{" "}
                        <span className="text-blue-600">
                          {nextPRId || "Loading..."}
                        </span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold">
                        บริษัท: {formData.company || "โปรดระบุบริษัท"}
                      </h3>
                      <p className="text-sm">ใบขอซื้อ</p>
                    </div>
                  </div>

                  <hr className="my-4 border-t-2 border-gray-300" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        แผนก
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                        placeholder="เช่น ฝ่ายการตลาด, ฝ่ายไอที"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ตำแหน่ง
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                        placeholder="เช่น ผู้จัดการ, พนักงาน"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        วันที่ต้องการใช้
                      </label>
                      <input
                        type="date"
                        name="requiredDate"
                        value={formData.requiredDate}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        วันที่
                      </label>
                      <input
                        type="date"
                        name="requestDate"
                        value={formData.requestDate}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ชื่อ
                      </label>
                      <input
                        type="text"
                        name="requesterName"
                        value={formData.requesterName}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                        placeholder="ชื่อ-นามสกุลผู้ขอซื้อ"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        โทรศัพท์
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                        placeholder="เช่น 08-1234-5678"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-bold text-lg mb-3">
                      รายการสินค้า/บริการ
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="min-w-full border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-4 py-2 w-12">ลำดับ</th>
                            <th className="border px-4 py-2">รายการ</th>
                            <th className="border px-4 py-2">จำนวน/หน่วย</th>
                            <th className="border px-4 py-2">ราคาต่อหน่วย</th>
                            <th className="border px-4 py-2">หมายเหตุ</th>
                            <th className="border px-4 py-2 w-12">การกระทำ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.items.map((item, index) => (
                            <tr key={index}>
                              <td className="border px-4 py-2 text-center">
                                {index + 1}
                              </td>
                              <td className="border px-4 py-2">
                                <input
                                  type="text"
                                  name="description"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(index, e)}
                                  className="w-full border-0 focus:ring-0"
                                  placeholder="ชื่อสินค้า/บริการ"
                                  required
                                />
                              </td>
                              <td className="border px-4 py-2">
                                <div className="flex">
                                  <input
                                    type="number"
                                    name="quantity"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="w-16 border-0 focus:ring-0"
                                    min="1"
                                    placeholder="จำนวน"
                                    required
                                  />
                                  <span className="mx-1">/</span>
                                  <input
                                    type="text"
                                    name="unit"
                                    value={item.unit}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="w-20 border-0 focus:ring-0"
                                    placeholder="หน่วย"
                                    required
                                  />
                                </div>
                              </td>
                              <td className="border px-4 py-2">
                                <input
                                  type="number"
                                  name="unitPrice"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(index, e)}
                                  className="w-full border-0 focus:ring-0"
                                  min="0"
                                  placeholder="ราคาต่อหน่วย"
                                  required
                                />
                              </td>
                              <td className="border px-4 py-2">
                                <input
                                  type="text"
                                  name="remarks"
                                  value={item.remarks}
                                  onChange={(e) => handleItemChange(index, e)}
                                  className="w-full border-0 focus:ring-0"
                                  placeholder="รายละเอียดเพิ่มเติม"
                                />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="text-red-500 hover:text-red-700"
                                  title="ลบรายการนี้"
                                >
                                  ลบ
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        เพิ่มสินค้า
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          ผู้ขอสั่งซื้อ
                        </label>
                        <input
                          type="text"
                          name="requester"
                          value={formData.requester}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          placeholder="ชื่อผู้ขอซื้อ"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          เจ้าหน้าที่ฝ่ายจัดซื้อ
                        </label>
                        <input
                          type="text"
                          name="purchasingOfficer"
                          value={formData.purchasingOfficer}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          placeholder="ชื่อเจ้าหน้าที่จัดซื้อ"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="text-red-500 text-sm mt-2">
                      {submitError}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={toggleForm}
                      className="px-4 py-2 border rounded hover:bg-gray-100"
                      disabled={isSubmitting}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "กำลังส่งข้อมูล..." : "สร้างใบขอซื้อ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">คำขอซื้อที่รออนุมัติ</h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {orders.filter((o) => o.status === "รออนุมัติ").length} รายการ
              </span>
            </div>
            <div className="space-y-3">
              {orders
                .filter((o) => o.status === "รออนุมัติ")
                .map((order) => (
                  <div
                    key={order.purchaseRequestId}
                    className="border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{order.description}</span>
                      <span className="text-blue-600">
                        {order.items.length} รายการ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>฿{order.totalPrice.toLocaleString()}</span>
                      <span className="text-yellow-600">{order.status}</span>
                    </div>
                  </div>
                ))}
            </div>
            <button className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
              ดูทั้งหมด
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-3">สถานะงบประมาณ</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>ใช้ไปแล้ว</span>
                <span>฿{usedBudget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(usedBudget / totalBudget) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">งบประมาณคงเหลือ</p>
              <p className="text-2xl font-bold text-green-600">
                ฿{remainingBudget.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                จากทั้งหมด ฿{totalBudget.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">แจ้งเตือน</h3>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {notifications.length} รายการ
              </span>
            </div>
            <div className="space-y-3">
              {notifications.map((note) => (
                <div
                  key={note.notificationId}
                  className="flex items-start space-x-2"
                >
                  <span
                    className={`mt-1 flex-shrink-0 ${
                      note.priority === "high"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    ⚠️
                  </span>
                  <p className="text-sm">{note.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">สถิติการสั่งซื้อรายเดือน</h3>
            <select className="border rounded px-3 py-1 text-sm">
              <option>ปี 2566</option>
              <option>ปี 2565</option>
              <option>ปี 2564</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} รายการ`, "จำนวน"]}
                  labelFormatter={(label) => `เดือน ${label}`}
                />
                <Bar
                  dataKey="total"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  name="จำนวนคำขอซื้อ"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchasingDashboard;
