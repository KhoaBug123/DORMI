import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  roomId: string;
  roomTitle: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
  tenantName?: string;
  tenantPhone?: string;
}

interface MaintenanceTicket {
  id: string;
  roomTitle: string;
  issueType: string;
  description: string;
  status: 'pending' | 'fixing' | 'completed';
  createdAt: string;
  tenantName?: string;
}

export default function LandlordDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);

  useEffect(() => {
    const savedApps = JSON.parse(localStorage.getItem('appointments') || '[]');
    if (savedApps.length === 0) {
      const mockApps: Appointment[] = [
        {
          id: 'app-mock-1',
          roomId: 'r-1',
          roomTitle: 'Phòng Trọ Studio 360° Gần ĐH Bách Khoa',
          date: '2026-06-18',
          time: '09:30',
          status: 'pending',
          tenantName: 'Lê Quốc Khánh',
          tenantPhone: '0987654321'
        },
        {
          id: 'app-mock-2',
          roomId: 'r-2',
          roomTitle: 'Nhà Ở Ghép Homestay Giá Rẻ NEU',
          date: '2026-06-20',
          time: '15:00',
          status: 'accepted',
          tenantName: 'Nguyễn Văn Hải',
          tenantPhone: '0912345678'
        }
      ];
      localStorage.setItem('appointments', JSON.stringify(mockApps));
      setAppointments(mockApps);
    } else {
      setAppointments(savedApps);
    }

    const savedTickets = JSON.parse(localStorage.getItem('maintenance_tickets') || '[]');
    if (savedTickets.length === 0) {
      const mockTickets: MaintenanceTicket[] = [
        {
          id: 'ticket-mock-1',
          roomTitle: 'Phòng Trọ Studio 360° Gần ĐH Bách Khoa',
          issueType: 'Điện nước',
          description: 'Hỏng vòi nước bồn tắm chảy lênh láng nhà vệ sinh.',
          status: 'pending',
          createdAt: '2026-06-14',
          tenantName: 'Lê Quốc Khánh'
        }
      ];
      localStorage.setItem('maintenance_tickets', JSON.stringify(mockTickets));
      setTickets(mockTickets);
    } else {
      setTickets(savedTickets);
    }
  }, []);

  const handleUpdateAppointment = (id: string, newStatus: 'accepted' | 'declined') => {
    const updated = appointments.map((app) => 
      app.id === id ? { ...app, status: newStatus } : app
    );
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
  };

  const handleUpdateTicket = (id: string, newStatus: 'fixing' | 'completed') => {
    const updated = tickets.map((t) => 
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTickets(updated);
    localStorage.setItem('maintenance_tickets', JSON.stringify(updated));
  };

  const stats = {
    totalRooms: 3,
    rented: 2,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length,
    pendingTickets: tickets.filter(t => t.status !== 'completed').length,
  };

  // Dữ liệu biểu đồ giả lập lượt xem (Simulation views)
  const viewsChart = [
    { day: 'T2', views: 80 },
    { day: 'T3', views: 120 },
    { day: 'T4', views: 95 },
    { day: 'T5', views: 140 },
    { day: 'T6', views: 190 },
    { day: 'T7', views: 240 },
    { day: 'CN', views: 210 }
  ];

  return (
    <div className="pt-20 min-h-screen bg-[#080c14] text-white px-4 md:px-8 lg:px-12 pb-12 font-sans relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">Khu vực quản lý</span>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mt-3">
              📊 Bảng Điều Khiển Chủ Trọ
            </h1>
            <p className="text-slate-400 text-xs mt-1">Quản trị các tin đăng phòng, đặt lịch hẹn và xử lý yêu cầu sự cố.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link 
              to="/landlord/create-room" 
              className="flex-1 md:flex-initial text-center px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white text-xs font-bold shadow-lg hover:opacity-95 transition-all"
            >
              ➕ Đăng phòng cho thuê
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng số phòng trọ', val: stats.totalRooms, icon: '🏢', color: 'text-blue-400', border: 'border-blue-500/10' },
            { label: 'Phòng đã cho thuê', val: stats.rented, icon: '🔑', color: 'text-emerald-400', border: 'border-emerald-500/10' },
            { label: 'Lịch hẹn chờ duyệt', val: stats.pendingAppointments, icon: '📅', color: 'text-amber-400', border: 'border-amber-500/10' },
            { label: 'Sự cố cần sửa chữa', val: stats.pendingTickets, icon: '🛠️', color: 'text-rose-400', border: 'border-rose-500/10' },
          ].map((s, idx) => (
            <div key={idx} className={`bg-white/5 border ${s.border} rounded-2xl p-5 backdrop-blur-md flex items-center justify-between shadow-xl`}>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-black ${s.color} mt-2`}>{s.val}</p>
              </div>
              <span className="text-2xl bg-white/5 p-3 rounded-xl border border-white/5">{s.icon}</span>
            </div>
          ))}
        </div>

        {/* Analytics & Views chart representation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột trái: Biểu đồ Analytics lượt xem (2 cols width) */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-slate-200">📈 Thống kê lượt tiếp cận tin đăng (Tuần này)</h3>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +24% so với tuần trước
              </span>
            </div>

            {/* Custom SVG/CSS Bar Chart */}
            <div className="h-52 flex items-end justify-between gap-2 pt-4 px-2">
              {viewsChart.map((item, idx) => {
                const heightPercent = (item.views / 250) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end group">
                    <span className="text-[10px] text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.views}
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 via-indigo-500 to-purple-400 rounded-t-lg transition-all duration-700 ease-out hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs text-slate-400 font-bold">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Profile Status Summary (1 col width) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between gap-5">
            <div>
              <h3 className="text-sm font-bold text-slate-200 border-b border-white/5 pb-3">🛡️ Trạng thái Chủ trọ</h3>
              
              <div className="mt-4 flex items-center gap-3">
                <span className="text-4xl bg-white/5 p-2 rounded-xl border border-white/5">👤</span>
                <div>
                  <h4 className="font-bold text-sm">Landlord Tester</h4>
                  <p className="text-[10px] text-slate-400">ID: l-1 | Vai trò: Chủ nhà</p>
                </div>
              </div>

              <div className="mt-5 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs space-y-2 leading-relaxed">
                <p className="font-bold flex items-center gap-1">
                  <span>✓</span> Tài khoản đã định danh (eKYC)
                </p>
                <p className="text-slate-300 text-[11px]">
                  Danh tính của bạn đã được đối sánh chính xác. Các tin đăng của bạn sẽ tự động kích hoạt huy hiệu xanh lá uy tín trên bản đồ GIS.
                </p>
              </div>
            </div>

            <Link 
              to="/landlord/premium" 
              className="w-full text-center py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs font-bold rounded-xl shadow-md"
            >
              💎 Mua Gói Đẩy Tin VIP
            </Link>
          </div>

        </div>

        {/* Appointments and Tickets List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Lịch Hẹn Xem Phòng */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/10 pb-3">
              <span>📅</span> Quản lý các lịch đặt hẹn xem phòng
            </h3>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {appointments.map((app) => (
                <div key={app.id} className="p-4 bg-black/20 border border-white/5 rounded-xl flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-xs text-slate-200 line-clamp-1">{app.roomTitle}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      app.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 
                      app.status === 'declined' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 
                      'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse'
                    }`}>
                      {app.status === 'accepted' ? 'Đã đồng ý' : app.status === 'declined' ? 'Đã từ chối' : 'Đang chờ duyệt'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <p>🕒 Thời gian hẹn: <strong className="text-slate-300">{app.date} lúc {app.time}</strong></p>
                    {app.tenantName && (
                      <p className="flex justify-between items-center">
                        <span>👤 Người hẹn: <strong className="text-slate-300">{app.tenantName}</strong></span>
                        <span className="text-[10px] text-blue-400 font-bold">{app.tenantPhone}</span>
                      </p>
                    )}
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex gap-2 pt-1 border-t border-white/5">
                      <button 
                        onClick={() => handleUpdateAppointment(app.id, 'accepted')}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md"
                      >
                        Chấp nhận
                      </button>
                      <button 
                        onClick={() => handleUpdateAppointment(app.id, 'declined')}
                        className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-slate-400 rounded-lg text-xs font-bold transition-all"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {appointments.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-12">Không có yêu cầu đặt lịch hẹn xem phòng nào.</p>
              )}
            </div>
          </div>

          {/* Sự Cố Báo Hỏng */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/10 pb-3">
              <span>🛠️</span> Sự cố báo hỏng & Sửa chữa thiết bị
            </h3>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 bg-black/20 border border-white/5 rounded-xl flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-bold text-xs text-slate-200 line-clamp-1">{ticket.roomTitle}</span>
                      <span className="text-[9px] text-rose-300 font-bold bg-rose-500/15 border border-rose-500/20 px-2 py-0.5 rounded mt-1.5 inline-block">
                        ⚠️ Phân loại: {ticket.issueType}
                      </span>
                    </div>
                    
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 
                      ticket.status === 'fixing' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 
                      'bg-rose-500/15 text-rose-400 border border-rose-500/20 animate-pulse'
                    }`}>
                      {ticket.status === 'completed' ? 'Đã hoàn thành' : ticket.status === 'fixing' ? 'Đang sửa chữa' : 'Chờ xử lý'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-lg border border-white/5 italic">
                    "{ticket.description}"
                  </p>

                  <div className="text-[10px] text-slate-500 flex justify-between items-center">
                    <span>👤 Gửi bởi: {ticket.tenantName}</span>
                    <span>📅 Gửi lúc: {ticket.createdAt}</span>
                  </div>

                  {ticket.status !== 'completed' && (
                    <div className="flex gap-2 pt-1 border-t border-white/5">
                      {ticket.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateTicket(ticket.id, 'fixing')}
                          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md"
                        >
                          Tiếp nhận sửa chữa sự cố
                        </button>
                      )}
                      {ticket.status === 'fixing' && (
                        <button 
                          onClick={() => handleUpdateTicket(ticket.id, 'completed')}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md"
                        >
                          Đã xử lý xong (Đóng Ticket)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {tickets.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-12">Không có yêu cầu báo hỏng nào.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
