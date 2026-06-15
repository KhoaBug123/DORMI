import { useState } from 'react';

interface MaintenanceTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MaintenanceTicketModal({ isOpen, onClose, onSuccess }: MaintenanceTicketModalProps) {
  const [roomTitle, setRoomTitle] = useState('Phòng Trọ Studio 360° Gần ĐH Bách Khoa');
  const [issueType, setIssueType] = useState('Điện nước');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const savedTickets = JSON.parse(localStorage.getItem('maintenance_tickets') || '[]');
    const newTicket = {
      id: `ticket-${Date.now()}`,
      roomTitle,
      issueType,
      description,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      tenantName: 'Tân Sinh Viên'
    };

    setTimeout(() => {
      localStorage.setItem('maintenance_tickets', JSON.stringify([...savedTickets, newTicket]));
      setLoading(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[#0d1424] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in text-white relative">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">Sự cố khẩn cấp</span>
            <h3 className="text-lg font-black text-slate-100 mt-1.5 flex items-center gap-2">
              <span>🛠️</span> Báo cáo hỏng hóc & Sự cố
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/10 hover:border-white/20 p-2 rounded-lg text-xs"
            title="Đóng cửa sổ"
          >
            ✕
          </button>
        </div>

        {/* Inputs form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Room target select */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Chọn phòng đang thuê
            </label>
            <select
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="Phòng Trọ Studio 360° Gần ĐH Bách Khoa">Phòng Trọ Studio 360° Gần ĐH Bách Khoa</option>
              <option value="Nhà Ở Ghép Homestay Giá Rẻ NEU">Nhà Ở Ghép Homestay Giá Rẻ NEU</option>
            </select>
          </div>

          {/* Fault Category */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Phân loại sự cố
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="Điện nước">Hệ thống Điện nước (Vỡ ống, hỏng vòi)</option>
              <option value="Đồ gia dụng">Thiết bị điện tử gia dụng (AC, Tủ lạnh)</option>
              <option value="Khóa cửa">Cửa khóa & An ninh</option>
              <option value="Khác">Vấn đề khác</option>
            </select>
          </div>

          {/* Fault Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Mô tả chi tiết sự cố
            </label>
            <textarea
              required
              rows={4}
              placeholder="Vui lòng viết mô tả chi tiết lỗi hỏng hóc (Ví dụ: vòi nước bồn rửa mặt bị gãy chảy nước, điều hòa chảy nước vào giường ngủ...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Buttons actions */}
          <div className="flex gap-3 pt-3 border-t border-white/5 text-xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-white/10 rounded-xl text-slate-400 hover:bg-white/5 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || !description}
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-xl shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang gửi sự cố...' : 'Gửi Yêu Cầu Sửa'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
