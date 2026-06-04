import React, { useState, useEffect } from 'react';

const OrderTracking = () => {
    const [selectedTracking, setSelectedTracking] = useState(null);
    const [trackingDetails, setTrackingDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [assetReceiptDetails, setAssetReceiptDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({
        receivedQuantity: '',
        quality: '',
        status: '',
        trackingNumber: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/purchase-orders");
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                const formattedData = data.map(item => ({
                    detailId: item.purchaseOrderId || 'N/A',
                    receiptItemId: item.purchaseRequestId || 'N/A',
                    receivedQuantity: item.totalPrice || 0,
                    receivedDate: new Date(item.createdAt).toISOString().split('T')[0] || 'N/A',
                    quality: 0,
                    createdAt: new Date(item.createdAt).toISOString().split('T')[0] || 'N/A',
                    updatedAt: new Date(item.createdAt).toISOString().split('T')[0] || 'N/A',
                    trackingNumber: item.trackingNumber || `TRK${Math.floor(100000 + Math.random() * 900000)}`,
                    status: item.status || 'Pending',
                    location: item.department || 'Unknown',
                    updates: [
                        {
                            time: new Date(item.createdAt).toLocaleTimeString(),
                            date: new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                            status: `สถานะ: ${item.status}`
                        }
                    ],
                    // Include original item data for reference
                    originalItem: item
                }));
                
                setAssetReceiptDetails(formattedData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTrackingClick = (trackingNumber) => {
        const trackingInfo = assetReceiptDetails.find(item => item.trackingNumber === trackingNumber);
        setSelectedTracking(trackingNumber);
        setTrackingDetails(trackingInfo);
    };

    const handleEditClick = (item) => {
        setEditingItem(item.detailId);
        setEditFormData({
            receivedQuantity: item.receivedQuantity,
            quality: item.quality,
            status: item.status,
            trackingNumber: item.trackingNumber
        });
    };

    const handleEditSubmit = async (detailId) => {
        try {
            // 1. ดึงข้อมูลเดิม
            const originalItem = assetReceiptDetails.find(item => item.detailId === detailId)?.originalItem;
            if (!originalItem) {
                throw new Error('ไม่พบข้อมูลใบสั่งซื้อ');
            }
            // 2. เตรียมข้อมูลสำหรับอัปเดต - แก้ไขเฉพาะ totalPrice โดยตรง
            const updateData = {
                status: editFormData.status,
                trackingNumber: editFormData.trackingNumber,
                totalPrice: editFormData.receivedQuantity, // ตั้งค่า totalPrice ใหม่
                updatedAt: new Date().toISOString()
            };
    
            // 3. ส่งเฉพาะฟิลด์ที่จำเป็นและอนุญาตให้แก้ไข
            const allowedUpdateData = {
                status: updateData.status,
                trackingNumber: updateData.trackingNumber,
                totalPrice: updateData.totalPrice,
                updatedAt: updateData.updatedAt
            };
            console.log(allowedUpdateData);
            
            // 4. ส่ง request ไปยัง API
            const response = await fetch(`http://localhost:3000/api/purchase-orders/${detailId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(allowedUpdateData)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'การอัปเดตล้มเหลว');
            }
    
            // 5. อัปเดต state ตาม response
            const responseData = await response.json();
            
            const updatedDetails = assetReceiptDetails.map(item => 
                item.detailId === detailId ? {
                    ...item,
                    receivedQuantity: responseData.data.totalPrice, // ใช้ค่าจาก response
                    status: responseData.data.status,
                    trackingNumber: responseData.data.trackingNumber,
                    updatedAt: new Date().toISOString().split('T')[0],
                    updates: [{
                        time: new Date().toLocaleTimeString(),
                        date: new Date().toLocaleDateString('en-GB'),
                        status: `อัปเดตยอดรวมเป็น: ${responseData.data.totalPrice} บาท`
                    }, ...item.updates],
                    originalItem: responseData.data
                } : item
            );
    
            setAssetReceiptDetails(updatedDetails);
            setEditingItem(null);
            if (selectedTracking === editFormData.trackingNumber) {
                setTrackingDetails(updatedDetails.find(item => item.detailId === detailId));
            }
    
            alert(`อัปเดตยอดรวมเป็น ${responseData.data.totalPrice} บาท สำเร็จแล้ว`);
            
        } catch (error) {
            console.error('Error:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    // ... rest of the component remains the same ...
    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Transit': return 'bg-blue-100 text-blue-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredDetails = assetReceiptDetails.filter(item =>
        item.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.detailId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.receiptItemId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100 min-h-screen p-6 flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p className="font-bold">เกิดข้อผิดพลาด:</p>
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        ลองอีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen p-6 flex flex-col md:flex-row">
            <div className="w-full mb-6 md:mb-0 md:mr-6">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="ค้นหา: Tracking Number, Detail ID, Receipt Item ID หรือ Status"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border border-gray-400 bg-white rounded w-full focus:outline-none focus:border-orange-400"
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200 border-b">
                                <th className="border p-2">Detail ID</th>
                                <th className="border p-2">Receipt Item ID</th>
                                <th className="border p-2">Received Quantity</th>
                                <th className="border p-2">Received Date</th>
                                <th className="border p-2">Quality</th>
                                <th className="border p-2">Created At</th>
                                <th className="border p-2">Updated At</th>
                                <th className="border p-2">Tracking Number</th>
                                <th className="border p-2">Status</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDetails.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">
                                        {assetReceiptDetails.length === 0 
                                            ? "ไม่มีข้อมูลในระบบ" 
                                            : "ไม่พบข้อมูลที่ค้นหา"}
                                    </td>
                                </tr>
                            ) : (
                                filteredDetails.map((item) => (
                                    <tr key={item.detailId} className="text-center border-b hover:bg-gray-50">
                                        <td className="border p-2">{item.detailId}</td>
                                        <td className="border p-2">{item.receiptItemId}</td>
                                        
                                        {editingItem === item.detailId ? (
                                            <>
                                                <td className="border p-2">
                                                    <input
                                                        type="number"
                                                        value={editFormData.receivedQuantity}
                                                        onChange={(e) => setEditFormData({...editFormData, receivedQuantity: e.target.value})}
                                                        className="w-20 p-1 border rounded"
                                                    />
                                                </td>
                                                <td className="border p-2">{item.receivedDate}</td>
                                                <td className="border p-2">
                                                    <input
                                                        type="number"
                                                        min="1" max="10"
                                                        value={editFormData.quality}
                                                        onChange={(e) => setEditFormData({...editFormData, quality: e.target.value})}
                                                        className="w-20 p-1 border rounded"
                                                    />
                                                </td>
                                                <td className="border p-2">{item.createdAt}</td>
                                                <td className="border p-2">{item.updatedAt}</td>
                                                <td className="border p-2">
                                                    <input
                                                        type="text"
                                                        value={editFormData.trackingNumber}
                                                        onChange={(e) => setEditFormData({...editFormData, trackingNumber: e.target.value})}
                                                        className="w-32 p-1 border rounded"
                                                    />
                                                </td>
                                                <td className="border p-2">
                                                    <select
                                                        value={editFormData.status}
                                                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                                        className="p-1 border rounded"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </td>
                                                <td className="border p-2 space-x-2">
                                                    <button 
                                                        onClick={() => handleEditSubmit(item.detailId)}
                                                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                    >
                                                        บันทึก
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingItem(null)}
                                                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="border p-2">{item.receivedQuantity}</td>
                                                <td className="border p-2">{item.receivedDate}</td>
                                                <td className="border p-2">{item.quality}</td>
                                                <td className="border p-2">{item.createdAt}</td>
                                                <td className="border p-2">{item.updatedAt}</td>
                                                <td className="border p-2">
                                                    {item.trackingNumber ? (
                                                        <button 
                                                            className="text-blue-500 underline hover:text-blue-700"
                                                            onClick={() => handleTrackingClick(item.trackingNumber)}
                                                        >
                                                            {item.trackingNumber}
                                                        </button>
                                                    ) : 'N/A'}
                                                </td>
                                                <td className="border p-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="border p-2">
                                                    <button 
                                                        onClick={() => handleEditClick(item)}
                                                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                                    >
                                                        แก้ไข
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedTracking && trackingDetails && (
                <div className="w-full md:w-1/3 mt-6 md:mt-0">
                    <div className="bg-white p-4 shadow-md rounded-lg sticky top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">รายละเอียดการติดตาม</h2>
                            <button 
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setSelectedTracking(null)}
                            >
                                ปิด
                            </button>
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                            <span className="font-semibold">Tracking Number:</span> {selectedTracking}
                        </p>
                        
                        <div className="border-l-2 border-gray-300 pl-4">
                            {trackingDetails.updates?.length > 0 ? (
                                trackingDetails.updates.map((update, index) => (
                                    <div key={index} className="mb-4">
                                        <p className="text-gray-500 font-bold">{update.time} - {update.date}</p>
                                        <p className="text-gray-600">{update.status}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">ไม่มีข้อมูลการอัปเดต</p>
                            )}
                        </div>
                        
                        {trackingDetails.status === "Delivered" && (
                            <div className="mt-4">
                                <h3 className="text-lg font-bold mb-2">หลักฐานการจัดส่ง</h3>
                                {trackingDetails.imageUrl ? (
                                    <img 
                                        src={trackingDetails.imageUrl} 
                                        alt="Delivered Package" 
                                        className="w-full rounded-lg border border-gray-200"
                                    />
                                ) : (
                                    <p className="text-gray-500">ไม่มีรูปภาพหลักฐาน</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;