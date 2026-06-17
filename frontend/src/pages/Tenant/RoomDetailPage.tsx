// React component file
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import VirtualTour360 from '../../components/VirtualTour360';

interface RoomDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  roomType: string;
  address: string;
  virtual3DUrl: string | null;
  image: string;
  amenities: {
    wifi: boolean;
    ac: boolean;
    parking: boolean;
    privateBathroom: boolean;
  };
  landlord: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    phone: string;
  };
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // QR Modal State
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/rooms/${id}`)
      .then((res) => {
        setRoom(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching room details:", err);
        setError("Không thể tải thông tin chi tiết phòng trọ. Vui lòng thử lại sau.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleStartChat = () => {
    if (!room) return;
    const activeContact = { id: room.landlord.id, name: room.landlord.name, isRoommate: false };
    localStorage.setItem('chat_active_contact', JSON.stringify(activeContact));
    navigate('/chat');
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !appointmentDate || !appointmentTime) return;

    setBookingLoading(true);
    try {
      const combinedDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
      await api.post('/dashboard/appointments', {
        roomId: room.id,
        appointmentDate: combinedDateTime.toISOString(),
        notes: notes
      });
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 5000);
      setNotes('');
    } catch (err: any) {
      alert(err.response?.data?.message || "Đặt lịch hẹn thất bại.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-[#080c14] text-white flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-r-indigo-500 border-b-purple-500 border-l-transparent animate-spin mb-4" />
        <p className="text-slate-400 text-sm animate-pulse">Đang tải thông tin phòng trọ 3D...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="pt-20 min-h-screen bg-[#080c14] text-white flex items-center justify-center font-sans px-4">
        <div className="max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <span className="text-5xl block">⚠️</span>
          <h2 className="text-xl font-bold text-slate-100">Đã xảy ra lỗi</h2>
          <p className="text-slate-400 text-xs leading-relaxed">{error || "Phòng trọ không tồn tại."}</p>
          <Link to="/explore" className="inline-block px-5 py-2.5 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md">
            Quay lại Bản đồ
          </Link>
        </div>
      </div>
    );
  }

  const priceMillions = (room.price / 1000000).toFixed(1);

  return (
    <div className="pt-16 min-h-screen bg-[#080c14] text-white font-sans pb-12">
      {/* 360 virtual tour container */}
      <div className="w-full bg-black relative border-b border-white/10">
        <VirtualTour360 imageUrl={room.virtual3DUrl || ''} height="480px" label={room.title} />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Room Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {room.roomType === 'single' ? '🏠 Phòng đơn' : room.roomType === 'shared' ? '🤝 Phòng ở ghép' : '🏢 Căn hộ khép kín'}
              </span>
              {room.landlord.isVerified && (
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                  🛡️ eKYC Verified
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 leading-tight">
              {room.title}
            </h1>

            <p className="text-sm text-slate-400 flex items-start gap-1">
              <span>📍</span> {room.address}
            </p>

            <div className="border-t border-white/5 pt-4 flex justify-between items-center flex-wrap gap-4">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Giá thuê tháng</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">
                  {priceMillions}M <span className="text-xs text-slate-500 font-normal">/ tháng</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Diện tích</p>
                <p className="text-lg font-black text-slate-200 mt-1">
                  {room.area} m²
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-3">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">
              📝 Mô tả phòng trọ
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {room.description}
            </p>
          </div>

          {/* Amenities details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">
              ⚙️ Tiện ích phòng trọ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Wi-Fi Free', available: room.amenities.wifi, icon: '📶' },
                { label: 'Điều hòa (AC)', available: room.amenities.ac, icon: '❄️' },
                { label: 'Bãi đỗ xe', available: room.amenities.parking, icon: '🛵' },
                { label: 'WC khép kín', available: room.amenities.privateBathroom, icon: '🚽' }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    item.available 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                      : 'bg-black/20 border-white/5 text-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-[11px] font-bold">{item.label}</div>
                  <div className="text-[9px] mt-0.5 opacity-80">{item.available ? '✓ Có sẵn' : '✕ Không có'}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Landlord Card & Booking Forms (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Landlord profile widget */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Thông tin chủ trọ</h3>
            
            <div className="flex items-center gap-4">
              <img src={room.landlord.avatar} alt={room.landlord.name} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-slate-100">{room.landlord.name}</h4>
                  {room.landlord.isVerified && <span className="text-xs" title="Đã xác thực eKYC">🛡️</span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Chủ sở hữu bất động sản</p>
                {room.landlord.isVerified ? (
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded mt-1.5 inline-block font-bold">
                    ✓ eKYC Đã Xác Minh
                  </span>
                ) : (
                  <span className="text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.2 rounded mt-1.5 inline-block font-bold">
                    ⚠️ Tài khoản thường
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 text-xs font-bold">
              <button 
                onClick={handleStartChat}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                💬 Trò chuyện trực tuyến
              </button>
              <button 
                onClick={() => setShowQR(true)}
                className="py-3 px-4 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500 hover:text-white text-purple-300 rounded-xl transition-colors"
                title="Đặt cọc giữ phòng trực tiếp"
              >
                💸 Đặt cọc giữ chỗ
              </button>
            </div>
          </div>

          {/* Appointment Scheduler form */}
          <div className="bg-[#0d1424] border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <span>📅</span> Đặt lịch hẹn xem phòng
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Chủ trọ sẽ nhận được thông báo để phê duyệt trực tiếp trên bảng điều khiển.</p>
            </div>

            {bookingSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <span>✅</span>
                <p>Đặt lịch xem phòng thành công! Theo dõi lịch hẹn tại trang cá nhân.</p>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chọn ngày</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chọn giờ</label>
                  <input
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ghi chú gửi chủ trọ</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Em muốn qua xem phòng chiều thứ 7 này..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading || !appointmentDate}
                className="w-full py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
              >
                {bookingLoading ? 'Đang gửi lịch hẹn...' : 'Xác Nhận Đặt Lịch Hẹn'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* QR Code Modal for Deposit */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#0d1424] border border-white/10 rounded-2xl p-6 shadow-2xl text-center space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-slate-300">💸 GIAO DỊCH ĐẶT CỌC GIỮ CHỖ</span>
              <button 
                onClick={() => setShowQR(false)}
                className="text-slate-400 hover:text-white transition-colors text-sm bg-white/5 border border-white/10 p-1 px-2.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
              {/* Mock Barcode visual */}
              <div className="text-[9px] font-mono leading-none tracking-widest text-black select-none font-bold">
                ██████████████████<br />
                ██  ██    ██  ██  ██<br />
                ██  ████  ██  ██  ██<br />
                ██████  ████████████<br />
                ██  ████  ██  ██  ██<br />
                ██████████████████<br />
                ██  ██    ██  ██  ██<br />
                ██████████████████
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">QUÉT QR CỌC GIỮ PHÒNG</h4>
              <p className="text-[10px] text-slate-500">Mức cọc cống định: 1.000.000đ. Hệ thống trung gian sẽ giữ tiền đến khi hoàn tất bàn giao phòng trọ.</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-xl text-left text-[11px] text-yellow-300 leading-relaxed">
              ⚠️ <strong>Lưu ý bảo mật:</strong> Chỉ chuyển khoản qua hệ thống trung gian của DORMI. Tuyệt đối không cọc trực tiếp bằng tiền mặt hoặc qua liên kết ngoài để phòng tránh lừa đảo.
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="w-full py-2.5 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
            >
              Đã Chuyển Khoản Thành Công
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
