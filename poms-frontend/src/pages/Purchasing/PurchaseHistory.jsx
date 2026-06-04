import React, { useState, useEffect } from "react";

const PurPurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [viewingPO, setViewingPO] = useState(null);
  const [showPOViewer, setShowPOViewer] = useState(false);
  const [formData, setFormData] = useState({
    documentNumber: "P06/108-002",
    documentDate: "2021-08-06",
    quoteReference: "QU6108-001",
    deliveryDate: "2021-08-13",
    originalDays: "15 วัน",
    shippingAddress: "เลขที่ 2571/1 ซอฟท์แวร์รีสอร์ท แขวงหัวหมาก เขตบางกราฟี กรุงเทพมหานคร 10240",
    items: [
      {
        productCode: "",
        productName: "",
        quantity: 1,
        unit: "เครื่อง",
        price: 0,
        discount: 0,
        receivedQuantity: 0,
        details: ""
      }
    ],
    notes: "",
    approveDate: "",
    receiveDate1: "",
    receiveDate2: "",
    receiveDate3: "",
    senderName: "",
    receiver1Name: "",
    receiver2Name: "",
    receiver3Name: ""
  });

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/purchase-orders");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching purchase orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  const handleReceiveAsset = (order) => {
    setSelectedOrder(order);
    setFormData(prev => ({
      ...prev,
      items: order.items.map(item => ({
        productCode: item.itemId,
        productName: item.description,
        quantity: item.quantity,
        unit: item.unit,
        price: item.unitPrice,
        discount: 0,
        receivedQuantity: item.quantity,
        details: ""
      })),
      notes: ""
    }));
    setShowPurchaseForm(true);
  };

  const handleViewPO = (order) => {
    setViewingPO(order);
    setFormData(prev => ({
      ...prev,
      items: order.items.map(item => ({
        productCode: item.itemId,
        productName: item.description,
        quantity: item.quantity,
        unit: item.unit,
        price: item.unitPrice,
        discount: 0,
        details: ""
      })),
      notes: order.notes || ""
    }));
    setShowPOViewer(true);
  };

  const handleClosePOViewer = () => {
    setShowPOViewer(false);
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    if (name.startsWith("items.")) {
      const [_, fieldName] = name.split(".");
      setFormData(prev => {
        const updatedItems = [...prev.items];
        updatedItems[index] = {
          ...updatedItems[index],
          [fieldName]: name.includes('price') || name.includes('discount') || name.includes('quantity') || name.includes('receivedQuantity')
            ? Number(value)
            : value
        };
        return {
          ...prev,
          items: updatedItems
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'discount' || name === 'quantity'
          ? Number(value)
          : value,
      }));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const currentOrder = viewingPO || selectedOrder;
      if (!currentOrder) {
        throw new Error('No purchase order selected');
      }

      // Prepare complete form data for submission
      const updateData = {
        status: "Pending",
        notes: formData.notes,
        trackingNumber: formData.documentNumber,
        updatedAt: new Date().toISOString(),
        approvalStatus: {
          approvedBy: formData.senderName || "Unknown",
          approvedAt: new Date().toISOString()
        },
        items: formData.items.map(item => ({
          itemId: item.productCode,
          description: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.price,
          discount: item.discount,
          totalItemPrice: (item.price * item.quantity - item.discount),
          receivedQuantity: item.receivedQuantity || item.quantity,
          notes: item.details
        }))
      };

      console.log('Submitting complete form data:', updateData);

      const response = await fetch(`http://localhost:3000/api/purchase-orders/${currentOrder.purchaseOrderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Server response:', responseData);
        throw new Error(responseData.message || `Status update failed (${response.status})`);
      }

      // Update local state with all changes
      setOrders(prev => prev.map(order =>
        order.purchaseOrderId === currentOrder.purchaseOrderId ? {
          ...order,
          ...responseData.data,
          status: "Pending",
          notes: formData.notes,
          trackingNumber: formData.documentNumber,
          items: updateData.items
        } : order
      ));

      alert(`บันทึกข้อมูลใบสั่งซื้อสำเร็จ!\nสถานะ: Pending\nเลขที่เอกสาร: ${formData.documentNumber}`);
      setShowPurchaseForm(false);
      setShowPOViewer(false);

    } catch (err) {
      console.error("Form Submission Error:", {
        error: err.message,
        formData: formData,
        currentStatus: viewingPO?.status
      });

      alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล:\n${err.message}\n\nโปรดตรวจสอบข้อมูลและลองอีกครั้ง`);
    }
  };

  const handleCloseForm = () => {
    setShowPurchaseForm(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* ส่วนตารางรายการสั่งซื้อ */}
      <div className="w-full bg-white border border-gray-300 shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-lg font-bold mb-4">ประวัติการสั่งซื้อ</h1>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2">รหัส PO</th>
                <th className="px-4 py-2">รหัส PR</th>
                <th className="px-4 py-2">แผนก</th>
                <th className="px-4 py-2">รายละเอียด</th>
                <th className="px-4 py-2">ราคารวม</th>
                <th className="px-4 py-2">วันที่สร้าง</th>
                <th className="px-4 py-2">วันที่ต้องการ</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.purchaseOrderId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{order.purchaseOrderId}</td>
                  <td className="px-4 py-2">{order.purchaseRequestId}</td>
                  <td className="px-4 py-2">{order.department}</td>
                  <td className="px-4 py-2">{order.description}</td>
                  <td className="px-4 py-2">{order.totalPrice}</td>
                  <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(order.requiredDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 font-semibold text-orange-500">{order.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    {order.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleViewPO(order)}
                          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-200"
                        >
                          ดูใบ PO
                        </button>
                        <button
                          onClick={() => handleReceiveAsset(order)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-200"
                        >
                          รับสินทรัพย์
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

      {/* Modal ดูข้อมูลใบ PO */}
      {showPOViewer && viewingPO && (
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
                    <div className="mb-1">บริษัท: {viewingPO.company}</div>
                    <div className="mb-1">แผนก: {viewingPO.department}</div>
                    <div className="mb-1">ผู้ขาย: {viewingPO.sellerName}</div>
                    <div className="mb-1">เลขที่ PO: {viewingPO.purchaseOrderId}</div>
                    <div className="mb-1">เลขที่ PR: {viewingPO.purchaseRequestId}</div>
                  </div>

                  <div className="border border-gray-300 p-3 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm">เลขที่เอกสาร</label>
                        <input
                          type="text"
                          name="documentNumber"
                          value={formData.documentNumber}
                          onChange={(e) => handleInputChange(e)}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm">วันที่เอกสาร</label>
                        <input
                          type="date"
                          name="documentDate"
                          value={formData.documentDate}
                          onChange={(e) => handleInputChange(e)}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm">วันที่ต้องการ</label>
                        <input
                          type="text"
                          value={new Date(viewingPO.requiredDate).toLocaleDateString()}
                          className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-sm">วันที่สร้าง</label>
                        <input
                          type="text"
                          value={new Date(viewingPO.createdAt).toLocaleDateString()}
                          className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                          readOnly
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm">รายละเอียด</label>
                        <input
                          type="text"
                          value={viewingPO.description}
                          className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                          readOnly
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
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2">
                          <input
                            type="text"
                            name={`items.productCode`}
                            value={item.productCode}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                            required
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            name={`items.productName`}
                            value={item.productName}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                            required
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            name={`items.quantity`}
                            value={item.quantity}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                            required
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            name={`items.unit`}
                            value={item.unit}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                            required
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            name={`items.price`}
                            value={item.price}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                            step="0.01"
                            required
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            name={`items.discount`}
                            value={item.discount}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                            step="0.01"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={(item.price * item.quantity - item.discount).toFixed(2)}
                            className="w-full p-1 border border-gray-300 rounded"
                            readOnly
                          />
                        </td>
                      </tr>
                    ))}
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
                    onChange={(e) => handleInputChange(e)}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="3"
                  ></textarea>
                </div>
                <div>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="border p-2 font-medium">รวมเป็นเงิน</td>
                        <td className="border p-2 text-right">
                          {formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">หักส่วนลด</td>
                        <td className="border p-2 text-right">
                          {formData.items.reduce((sum, item) => sum + item.discount, 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">ยอดหลังหักส่วนลด</td>
                        <td className="border p-2 text-right">
                          {formData.items.reduce((sum, item) => sum + (item.price * item.quantity - item.discount), 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">จำนวนภาษีมูลค่าเพิ่ม 7%</td>
                        <td className="border p-2 text-right">
                          {formData.items.reduce((sum, item) => sum + ((item.price * item.quantity - item.discount) * 0.07), 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td className="border p-2 font-bold">จำนวนเงินรวมทั้งสิ้น</td>
                        <td className="border p-2 text-right font-bold">
                          {formData.items.reduce((sum, item) => sum + ((item.price * item.quantity - item.discount) * 1.07), 0).toFixed(2)}
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
                    onChange={(e) => handleInputChange(e)}
                    placeholder="(ลงชื่อ)"
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                  <div className="text-sm">ตำแหน่ง</div>
                  <input
                    type="date"
                    name="approveDate"
                    value={formData.approveDate}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full p-1 border border-gray-300 rounded mt-1"
                  />
                </div>
                <div className="text-center">
                  <div className="mb-1">ผู้รับใบสั่งซื้อ</div>
                  <input
                    type="text"
                    name="receiver1Name"
                    value={formData.receiver1Name}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="(ลงชื่อ)"
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                  <div className="text-sm">ตำแหน่ง</div>
                  <input
                    type="date"
                    name="receiveDate1"
                    value={formData.receiveDate1}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full p-1 border border-gray-300 rounded mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleClosePOViewer}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  ปิด
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ฟอร์มใบรับสินทรัพย์ */}
      {showPurchaseForm && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitForm}>
              <div className="mb-6">
                <div className="text-center font-bold text-xl mb-2">
                  บริษัท โปรซอฟท์ ซีอาร์เอ็ม จํากัด
                </div>
                <div className="text-center text-sm mb-4">
                  287 หมู่ 5 ตําบลสันทรายน้อย อําเภอสันทราย จังหวัดเชียงใหม่ 50210
                  <br />
                  โทร 02-402-8068, 081-359-7689
                  <br />
                  อีเมล์ sale@prosoftbbiz.com เลขประจําตัวผู้เสียภาษี 0505557001854
                </div>

                <div className="text-center font-bold text-lg mb-4">
                  ใบรับสินทรัพย์
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="font-bold mb-1">ผู้ติดต่อ:</div>
                    <div className="mb-1">
                      บริษัท: {selectedOrder.company}
                    </div>
                    <div className="mb-1">
                      แผนก: {selectedOrder.department}
                    </div>
                    <div className="mb-1">เลขที่ PO: {selectedOrder.purchaseOrderId}</div>
                    <div className="mb-1">เลขที่ PR: {selectedOrder.purchaseRequestId}</div>
                  </div>

                  <div className="border border-gray-300 p-3 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm">เลขที่เอกสาร</label>
                        <input
                          type="text"
                          name="documentNumber"
                          value={formData.documentNumber}
                          onChange={(e) => handleInputChange(e)}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm">วันที่เอกสาร</label>
                        <input
                          type="date"
                          name="documentDate"
                          value={formData.documentDate}
                          onChange={(e) => handleInputChange(e)}
                          className="w-full p-1 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm">วันที่ต้องการ</label>
                        <input
                          type="text"
                          value={new Date(selectedOrder.requiredDate).toLocaleDateString()}
                          className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-sm">วันที่สร้าง</label>
                        <input
                          type="text"
                          value={new Date(selectedOrder.createdAt).toLocaleDateString()}
                          className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                          readOnly
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm">รายละเอียด</label>
                        <input
                          type="text"
                          value={selectedOrder.description}
                          className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                          readOnly
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
                      <th className="border p-2">รหัสสินค้า</th>
                      <th className="border p-2">รายการ</th>
                      <th className="border p-2">จำนวนที่สั่ง</th>
                      <th className="border p-2">จำนวนที่ได้รับ</th>
                      <th className="border p-2">ราคา(บาท)/หน่วย</th>
                      <th className="border p-2">ราคารวม(บาท)</th>
                      <th className="border p-2">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2">
                          <input
                            type="text"
                            name={`items.productCode`}
                            value={item.productCode}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                            required
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            name={`items.productName`}
                            value={item.productName}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                            required
                          />
                        </td>
                        <td className="border p-2">
                          <div className="flex items-center">
                            <input
                              type="number"
                              name={`items.quantity`}
                              value={item.quantity}
                              onChange={(e) => handleInputChange(e, index)}
                              className="w-16 p-1 border border-gray-300 rounded text-right"
                              required
                            />
                            <span className="mx-1">/</span>
                            <input
                              type="text"
                              name={`items.unit`}
                              value={item.unit}
                              onChange={(e) => handleInputChange(e, index)}
                              className="w-20 p-1 border border-gray-300 rounded"
                              required
                            />
                          </div>
                        </td>
                        <td className="border p-2">
                          <div className="flex items-center">
                            <input
                              type="number"
                              name={`items.receivedQuantity`}
                              value={item.receivedQuantity}
                              onChange={(e) => handleInputChange(e, index)}
                              className="w-16 p-1 border border-gray-300 rounded text-right"
                              required
                            />
                            <span className="mx-1">/</span>
                            <input
                              type="text"
                              name={`items.unit`}
                              value={item.unit}
                              onChange={(e) => handleInputChange(e, index)}
                              className="w-20 p-1 border border-gray-300 rounded"
                              required
                            />
                          </div>
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            name={`items.price`}
                            value={item.price}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                            step="0.01"
                            required
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={(
                              (Number(item.price) * Number(item.quantity) -
                                Number(item.discount)
                              ).toFixed(2))}
                            className="w-full p-1 border border-gray-300 rounded"
                            readOnly
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            name={`items.details`}
                            value={item.details}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-1 border border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ส่วนท้ายฟอร์ม */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมายเหตุ
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                ></textarea>
              </div>

              {/* ส่วนท้ายฟอร์ม */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className="text-center">
                  <div className="mb-1">พนักงานคลังสินค้า</div>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="(ลงชื่อ)"
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
                <div className="text-center">
                  <div className="mb-1">ผู้ตรวจสอบ</div>
                  <input
                    type="text"
                    name="receiver1Name"
                    value={formData.receiver1Name}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="(ลงชื่อ)"
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
                <div className="text-center">
                  <div className="mb-1">ผู้อนุมัติ</div>
                  <input
                    type="text"
                    name="receiver2Name"
                    value={formData.receiver2Name}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="(ลงชื่อ)"
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
                <div className="text-center">
                  <div className="mb-1">ผู้ส่งของ</div>
                  <input
                    type="text"
                    name="receiver3Name"
                    value={formData.receiver3Name}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="(ลงชื่อ)"
                    className="w-full p-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition duration-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurPurchaseHistory;