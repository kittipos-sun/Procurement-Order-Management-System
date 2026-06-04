import React, { useState, useEffect } from 'react';

const PurchaseInventory = () => {
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/purchase-requests");
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Transform the API data to match the table structure
        const transformedOrders = data.map(request => ({
          id: request.purchaseRequestId,
          name: request.description,
          price: request.totalPrice,
          quantity: request.itemCount,
          status: request.status === "Approved" ? "อนุมัติ" :
            request.status === "Rejected" ? "ถูกปฏิเสธ" :
              request.status === "Pending" ? "รอดำเนินการ" :
                request.status === "รอสั่งซื้อ" ? "รอสั่งซื้อ" :
                  request.status, // กรณีมีสถานะอื่นๆ
          requestData: request
        }));

        setOrders(transformedOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCreatePurchase = (order) => {
    setSelectedOrder(order);
    setShowPurchaseForm(true);
  };

  const handleCloseForm = () => {
    setShowPurchaseForm(false);
    setSelectedOrder(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      const response = await fetch("http://localhost:3000/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseRequestId: selectedOrder.id,
          sellerName: formData.sellerName,
          sellerContact: formData.sellerContact,
          sellerAddress: formData.sellerAddress || "",
          paymentTerms: formData.paymentTerms || "Net 30",
          description: formData.notes || selectedOrder.requestData.description
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create PO');
      }

      console.log('PO Created:', result);
      setShowPurchaseForm(false);

      // Refresh data
      const refreshResponse = await fetch("http://localhost:3000/api/purchase-requests");
      if (!refreshResponse.ok) throw new Error('Failed to refresh data');

      const refreshData = await refreshResponse.json();
      const refreshedOrders = refreshData.map(request => ({
        id: request.purchaseRequestId,
        name: request.description,
        price: request.totalPrice,
        quantity: request.itemCount,
        status: request.status === "Approved" ? "อนุมัติ" :
          request.status === "Rejected" ? "ถูกปฏิเสธ" :
            request.status === "รอสั่งซื้อ" ? "รอสั่งซื้อ" :
              "รอดำเนินการ",
        requestData: request
      }));
      setOrders(refreshedOrders);

    } catch (err) {
      console.error('Error:', err);
      alert(`เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center p-4">กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">เกิดข้อผิดพลาด: {error}</div>;
  }

  return (
    <div>
      <div className="w-full bg-white border border-gray-300 shadow-lg rounded-lg p-6">
        <h1 className="text-lg font-bold mb-4">รายการสั่งซื้อ</h1>

        <div className="overflow-hidden rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2">ลำดับ</th>
                <th className="px-4 py-2">ชื่อสินค้า</th>
                <th className="px-4 py-2">ราคา</th>
                <th className="px-4 py-2">จำนวน</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{order.name}</td>
                  <td className="px-4 py-2">{order.price.toFixed(2)}</td>
                  <td className="px-4 py-2">{order.quantity}</td>
                  <td className={`px-4 py-2 font-semibold ${order.status === "อนุมัติ" ? "text-green-600" :
                    order.status === "รอสั่งซื้อ" ? "text-blue-600" :
                      order.status === "ถูกปฏิเสธ" ? "text-red-500" :
                        order.status === "รอดำเนินการ" ? "text-orange-500" :
                          "text-gray-500"
                    }`}>
                    {order.status}
                  </td>
                  <td className="px-4 py-2">
                    {order.status === "อนุมัติ" && (
                      <button
                        onClick={() => handleCreatePurchase(order)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        สร้างใบสั่งซื้อ
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ฟอร์มใบสั่งซื้อ */}
      {showPurchaseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSubmitForm(Object.fromEntries(formData));
            }}>
              <div className="mb-6">
                <div className="text-center font-bold text-xl mb-2">บริษัท โปรซอฟท์ ซีอาร์เอ็ม จํากัด</div>
                <div className="text-center text-sm mb-4">
                  287 หมู่ 5 ตําบลสันทรายน้อย อําเภอสันทราย จังหวัดเชียงใหม่ 50210<br />
                  โทร 02-402-8068, 081-359-7689<br />
                  อีเมล์ sale@prosoftbbiz.com เลขประจําตัวผู้เสียภาษี 0505557001854
                </div>

                <div className="text-center font-bold text-lg mb-4">ใบสั่งซื้อ / Purchase Order</div>

                <div className="flex justify-between mb-4">
                  <div>
                    <div className="font-bold mb-1">ผู้ติดต่อ:</div>
                    <div className="mb-1">บริษัท: {selectedOrder.requestData.company}</div>
                    <div className="mb-1">แผนก: {selectedOrder.requestData.department}</div>
                    <div className="mb-1">ผู้สร้าง: {selectedOrder.requestData.createdBy}</div>
                    <div className="mb-1">โทร: {selectedOrder.requestData.phone}</div>
                  </div>

                  <div className="border border-gray-300 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm">ชื่อผู้ขาย</div>
                        <input
                          type="text"
                          name="sellerName"
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <div className="text-sm">ติดต่อผู้ขาย</div>
                        <input
                          type="text"
                          name="sellerContact"
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <div className="text-sm">ที่อยู่ผู้ขาย</div>
                        <input
                          type="text"
                          name="sellerAddress"
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm">เงื่อนไขการชำระ</div>
                        <input
                          type="text"
                          name="paymentTerms"
                          defaultValue="Net 30"
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm">เลขที่เอกสาร</div>
                        <input
                          type="text"
                          name="documentNumber"
                          defaultValue={`P06/108-002`}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm">วันที่เอกสาร</div>
                        <input
                          type="date"
                          name="documentDate"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <div className="text-sm">วันที่ต้องการ</div>
                        <input
                          type="date"
                          name="requiredDate"
                          defaultValue={selectedOrder.requestData.requiredDate}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm">วันที่กำหนดส่ง</div>
                        <input
                          type="date"
                          name="deliveryDate"
                          defaultValue={new Date(new Date(selectedOrder.requestData.requiredDate).getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ตารางรายการสินค้า */}
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="border p-2">ลำดับ</th>
                    <th className="border p-2">รหัสสินค้า</th>
                    <th className="border p-2">รายการ</th>
                    <th className="border p-2">จำนวน</th>
                    <th className="border p-2">หน่วย</th>
                    <th className="border p-2">ราคา/หน่วย</th>
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
                        defaultValue="IC6/108-028"
                        className="w-full p-1 border-0"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        name="productName"
                        defaultValue={selectedOrder.name}
                        className="w-full p-1 border-0"
                        required
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        name="quantity"
                        defaultValue={selectedOrder.quantity}
                        className="w-full p-1 border-0"
                        required
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        name="unit"
                        defaultValue="เครื่อง"
                        className="w-full p-1 border-0"
                        required
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        name="price"
                        defaultValue={(selectedOrder.price / selectedOrder.quantity).toFixed(2)}
                        className="w-full p-1 border-0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        name="discount"
                        defaultValue="0"
                        className="w-full p-1 border-0"
                        step="0.01"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        name="totalAmount"
                        defaultValue={selectedOrder.price.toFixed(2)}
                        className="w-full p-1 border-0"
                        readOnly
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ส่วนสรุปยอด */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                  <textarea
                    name="notes"
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="3"
                    defaultValue={selectedOrder.requestData.description}
                  ></textarea>
                </div>
                <div>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="border p-2 font-medium">รวมเป็นเงิน</td>
                        <td className="border p-2 text-right">{selectedOrder.price.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">หักส่วนลด</td>
                        <td className="border p-2 text-right">0.00</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">ยอดหลังหักส่วนลด</td>
                        <td className="border p-2 text-right">{selectedOrder.price.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">จำนวนภาษีมูลค่าเพิ่ม 7%</td>
                        <td className="border p-2 text-right">{(selectedOrder.price * 0.07).toFixed(2)}</td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td className="border p-2 font-bold">จำนวนเงินรวมทั้งสิ้น</td>
                        <td className="border p-2 text-right font-bold">
                          {(selectedOrder.price * 1.07).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ส่วนท้ายฟอร์ม */}
              <div className="flex justify-between mt-8">
                <div className="text-center">
                  <div className="mb-1">ผู้สั่งซื้อสินค้า</div>
                  <div className="border-t border-gray-400 pt-1 w-48 mx-auto">
                    <input
                      type="text"
                      name="buyerName"
                      placeholder='ผู้สั่งซื้อสินค้า'
                      className="w-full p-1 border-0 text-center"
                      required
                    />
                  </div>
                  <div className="text-sm">ผู้สร้างคำขอซื้อ</div>
                </div>
                <div className="text-center">
                  <div className="mb-1">ผู้รับใบสั่งซื้อ</div>
                  <div className="border-t border-gray-400 pt-1 w-48 mx-auto">
                    <input
                      type="text"
                      name="receiverName"
                      placeholder='ผู้รับใบสั่งซื้อ'
                      className="w-full p-1 border-0 text-center"
                      required
                    />
                  </div>
                  <div className="text-sm">ผู้รับผิดชอบฝ่ายจัดซื้อ</div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  บันทึกใบสั่งซื้อ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInventory;