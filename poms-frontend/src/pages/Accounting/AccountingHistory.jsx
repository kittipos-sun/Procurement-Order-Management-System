import React, { useState } from 'react';

// คอมโพเนนต์ตารางใบขอซื้อ (แก้ไขแล้ว)
const PurchaseRequestTable = ({ requests, onViewClick, onApprove, onReject }) => {
  return (
    <div className="w-full bg-white border border-gray-300 shadow-lg rounded-lg p-6 mb-6">
      <h1 className="text-lg font-bold mb-4">รายการใบขอซื้อ</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
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
            {requests.map((request, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">{request.code}</td>
                <td className="px-4 py-2">{request.name}</td>
                <td className="px-4 py-2">{request.price.toFixed(2)}</td>
                <td className="px-4 py-2">{request.quantity}</td>
                <td className="px-4 py-2">{request.unit}</td>
                <td className={`px-4 py-2 font-semibold ${
                  request.status === "รออนุมัติ" ? "text-orange-500" : 
                  request.status === "อนุมัติ" ? "text-green-600" : 
                  request.status === "ปฏิเสธ" ? "text-red-500" : 
                  "text-gray-500"
                }`}>
                  {request.status}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onViewClick(request)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ดูใบ PR
                  </button>
                  {request.status === "รออนุมัติ" && (
                    <>
                      <button
                        onClick={() => onApprove(request)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => onReject(request)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
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
  );
};

// คอมโพเนนต์ตารางใบแจ้งหนี้ (คงเดิม)
const InvoiceTable = ({ invoices, onViewSlipClick, onUploadClick }) => {
  return (
    <div className="w-full bg-white border border-gray-300 shadow-lg rounded-lg p-6 mb-6">
      <h1 className="text-lg font-bold mb-4">รายการใบแจ้งหนี้</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
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
            {invoices.map((invoice, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">{invoice.id}</td>
                <td className="px-4 py-2">{invoice.amount.toLocaleString()}</td>
                <td className="px-4 py-2">{invoice.paidAmount.toLocaleString()}</td>
                <td className="px-4 py-2">{invoice.dueDate}</td>
                <td className={`px-4 py-2 font-semibold ${
                  invoice.status === "Paid" ? "text-green-600" : 
                  invoice.status === "Partially Paid" ? "text-blue-600" : 
                  "text-red-500"
                }`}>
                  {invoice.status}
                </td>
                <td className="px-4 py-2">
                  {invoice.status === "Paid" ? (
                    <button
                      onClick={() => onViewSlipClick(invoice)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      ดูใบสลิป
                    </button>
                  ) : (
                    <button
                      onClick={() => onUploadClick(invoice)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      อัพโหลดสลิป
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AccountingHistory = () => {
  // สถานะสำหรับตารางใบขอซื้อ (แก้ไขสถานะเริ่มต้น)
  const [purchaseRequests, setPurchaseRequests] = useState([
    {
      code: "JC-0001",
      name: "คอมพิวเตอร์ ผู้มี 8 SAMSUNG ที่ดีเปิด/จัด",
      price: 258.00,
      quantity: 1,
      unit: "เครื่อง",
      status: "รออนุมัติ"
    },
    {
      code: "JC-0003",
      name: "เครื่อง SCAN สายค่าเมือง",
      price: 400.00,
      quantity: 1,
      unit: "เครื่อง",
      status: "รออนุมัติ"
    }
  ]);

  // สถานะสำหรับตารางใบแจ้งหนี้ (คงเดิม)
  const [invoices, setInvoices] = useState([
    {
      id: "IRV-1001",
      amount: 50000,
      paidAmount: 30000,
      dueDate: "2025-05-15",
      status: "Partially Paid",
      slipUrl: ""
    },
    {
      id: "IRV-1002",
      amount: 75000,
      paidAmount: 75000,
      dueDate: "2025-04-30",
      status: "Paid",
      slipUrl: "https://example.com/slip.jpg"
    }
  ]);

  // สถานะสำหรับ Modal ต่างๆ (คงเดิม)
  const [showPRModal, setShowPRModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // ฟังก์ชันการทำงาน (เพิ่มฟังก์ชันอนุมัติและปฏิเสธ)
  const handleViewPR = (request) => {
    setSelectedRequest(request);
    setShowPRModal(true);
  };

  const handleApprove = (request) => {
    const updatedRequests = purchaseRequests.map(req => 
      req.code === request.code 
        ? { ...req, status: "อนุมัติ" } 
        : req
    );
    setPurchaseRequests(updatedRequests);
    alert(`อนุมัติใบขอซื้อ ${request.code} เรียบร้อยแล้ว`);
  };

  const handleReject = (request) => {
    const updatedRequests = purchaseRequests.map(req => 
      req.code === request.code 
        ? { ...req, status: "ปฏิเสธ" } 
        : req
    );
    setPurchaseRequests(updatedRequests);
    alert(`ปฏิเสธใบขอซื้อ ${request.code} เรียบร้อยแล้ว`);
  };

  const handleViewSlip = (invoice) => {
    setSelectedInvoice(invoice);
    setShowSlipModal(true);
  };

  const handleUploadSlip = (invoice) => {
    setSelectedInvoice(invoice);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleSubmitSlip = () => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === selectedInvoice.id 
        ? { ...inv, status: "Paid", slipUrl: URL.createObjectURL(uploadedFile) } 
        : inv
    );
    setInvoices(updatedInvoices);
    setShowUploadModal(false);
    setUploadedFile(null);
  };

  return (
    <div className="p-4">
      {/* ตารางใบขอซื้อ (เพิ่ม props onApprove และ onReject) */}
      <PurchaseRequestTable 
        requests={purchaseRequests} 
        onViewClick={handleViewPR}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* ตารางใบแจ้งหนี้ (คงเดิม) */}
      <InvoiceTable 
        invoices={invoices} 
        onViewSlipClick={handleViewSlip}
        onUploadClick={handleUploadSlip}
      />

      {/* Modal ดูใบ PR (คงเดิม) */}
      {showPRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold">บริษัท โปรซอฟท์ ซีอาร์เอ็ม จำกัด</h1>
              <p className="text-sm">
                287 หมู่ 5 ตำบลสันทรายน้อย อำเภอสันทราย จังหวัดเชียงใหม่ 50210<br />
                โทร 02-402-8068, 081-359-7689<br />
                อีเมล์ sales@proscribbiz.com เลขประจำตัวผู้เสียภาษี 0505557001854
              </p>
            </div>

            <h2 className="text-lg font-bold text-center mb-4">ใบส่งต่อ / Purchase Order</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-bold mb-2">ผู้ติดต่อ:</h3>
                <p>บริษัท: บริษัท นันทนาอินฟอร์มครึ่งเซิลเตมิ้</p>
                <p>ที่อยู่: 607 ซอยรายอินทรา 8 ถนนรายอินทรา แขวงอนุสาวรีย์ เขตบางเขน กทม 10220</p>
                <p>โทร: 08-9108-2070</p>
                <p>เลขประจำตัวผู้เสียภาษีอากร: 2581251421512</p>
              </div>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">เลขที่เอกสาร</p>
                    <p>PQ-2025-001</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">วันที่เอกสาร</p>
                    <p>04/04/2025</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">อ้างอิงในเสนอราคา</p>
                    <p>-</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">วันที่กำหนดส่ง</p>
                    <p>15/04/2025</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">จำนวนวันแรกเริ่ม</p>
                    <p>7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-1">ที่อยู่จัดส่ง</h3>
              <p>607 ซอยรายอินทรา 8 ถนนรายอินทรา แขวงอนุสาวรีย์ เขตบางเขน กทม 10220</p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
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
                  {selectedRequest && (
                    <tr>
                      <td className="border p-2 text-center">1</td>
                      <td className="border p-2">{selectedRequest.code}</td>
                      <td className="border p-2">{selectedRequest.name}</td>
                      <td className="border p-2 text-center">{selectedRequest.quantity}</td>
                      <td className="border p-2 text-center">{selectedRequest.unit}</td>
                      <td className="border p-2 text-right">{selectedRequest.price.toFixed(2)}</td>
                      <td className="border p-2 text-right">0</td>
                      <td className="border p-2 text-right">{selectedRequest.price.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-bold mb-2">หมายเหตุ</h3>
                <div className="border border-gray-300 p-2 h-24"></div>
              </div>
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium">รวมเป็นเงิน</td>
                      <td className="border p-2 text-right">
                        {selectedRequest?.price.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">หักส่วนลด</td>
                      <td className="border p-2 text-right">0.00</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">ยอดหลังหักส่วนลด</td>
                      <td className="border p-2 text-right">
                        {selectedRequest?.price.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">จำนวนภาษีมูลค่าเพิ่ม 7%</td>
                      <td className="border p-2 text-right">
                        {(selectedRequest?.price * 0.07).toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="border p-2 font-bold">จำนวนเงินรวมทั้งสิ้น</td>
                      <td className="border p-2 text-right font-bold">
                        {(selectedRequest?.price * 1.07).toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="text-center">
                <p className="mb-8">ผู้ส่งอักษร</p>
                <p className="border-t border-gray-400 pt-2 inline-block">(ลงชื่อ)</p>
                <p className="text-sm">ตำแหน่ง</p>
                <p className="text-sm">04/04/2025</p>
              </div>
              <div className="text-center">
                <p className="mb-8">ผู้สั่งซื้อ</p>
                <p className="border-t border-gray-400 pt-2 inline-block">(ลงชื่อ)</p>
                <p className="text-sm">ตำแหน่ง</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPRModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ดูใบสลิป (คงเดิม) */}
      {showSlipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">ใบสลิปการชำระเงิน {selectedInvoice?.id}</h2>
              <button 
                onClick={() => setShowSlipModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">จำนวนเงิน</p>
                  <p className="font-medium">{selectedInvoice?.amount.toLocaleString()} บาท</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ชำระแล้ว</p>
                  <p className="font-medium">{selectedInvoice?.paidAmount.toLocaleString()} บาท</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">วันที่ครบกำหนด</p>
                  <p className="font-medium">{selectedInvoice?.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">สถานะ</p>
                  <p className="font-medium text-green-600">{selectedInvoice?.status}</p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                {selectedInvoice?.slipUrl ? (
                  <img 
                    src={selectedInvoice.slipUrl} 
                    alt="ใบสลิปการชำระเงิน" 
                    className="max-w-full h-auto mx-auto border rounded"
                  />
                ) : (
                  <p className="text-center text-gray-500">ไม่มีภาพสลิป</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowSlipModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  ปิด
                </button>
                {selectedInvoice?.slipUrl && (
                  <a 
                    href={selectedInvoice.slipUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    เปิดในแท็บใหม่
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal อัพโหลดสลิป (คงเดิม) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">อัพโหลดสลิปสำหรับ {selectedInvoice?.id}</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกไฟล์สลิปการโอน
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              
              {uploadedFile && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">ไฟล์ที่เลือก:</p>
                  <p className="text-sm">{uploadedFile.name}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmitSlip}
                  disabled={!uploadedFile}
                  className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${
                    !uploadedFile ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  อัพโหลด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingHistory;