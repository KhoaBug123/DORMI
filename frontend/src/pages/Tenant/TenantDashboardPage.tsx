import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MaintenanceTicketModal from '../../components/Tickets/MaintenanceTicketModal';
import { api } from '../../services/api';

interface Appointment {
  id: string;
  roomId: string;
  roomTitle: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface MaintenanceTicket {
  id: string;
  roomTitle: string;
  issueType: string;
  description: string;
  status: 'pending' | 'fixing' | 'completed';
  createdAt: string;
}

interface SavedRoom {
  id: string;
  title: string;
  price: number;
  address: string;
  image: string;
}

export default function TenantDashboardPage() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'tickets' | 'saved'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const fetchDashboardData = () => {
    api.get('/dashboard/appointments')
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Error fetching appointments:", err));

    api.get('/dashboard/tickets')
      .then((res) => setTickets(res.data))
      .catch((err) => console.error("Error fetching tickets:", err));

    api.get('/dashboard/saved')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setSavedRooms(res.data);
        } else {
          // Fallback to standard mock array if none favorited yet
          setSavedRooms([
            {
              id: 'r-1',
              title: 'Phòng Trọ Studio 360° Gần ĐH Bách Khoa',
              price: 4500000,
              address: 'Số 12 Ngõ 40 Tạ Quang Bửu, Hai Bà Trưng, Hà Nội',
              image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
            }
          ]);
        }
      })
      .catch(() => {
        setSavedRooms([
          {
            id: 'r-1',
            title: 'Phòng Trọ Studio 360° Gần ĐH Bách Khoa',
            price: 4500000,
            address: 'Số 12 Ngõ 40 Tạ Quang Bửu, Hai Bà Trưng, Hà Nội',
            image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
          }
        ]);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRemoveSavedRoom = async (id: string) => {
    try {
      await api.delete(`/dashboard/saved/${id}`);
      fetchDashboardData();
    } catch (err) {
      // Fallback local filtering if DB item didn't exist or failed
      setSavedRooms(savedRooms.filter(r => r.id !== id));
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-[#080c14] text-white px-4 md:px-8 lg:px-12 pb-12 font-sans relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">Khu vực sinh viên</span>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mt-3">
              👤 Dashboard Sinh Viên
            </h1>
            <p className="text-slate-400 text-xs mt-1">Theo dõi tiến độ lịch hẹn xem phòng, báo cáo sự cố thiết bị sinh hoạt.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold shadow-lg shadow-rose-500/10 hover:opacity-95 active:scale-[0.99] transition-all flex items-center gap-1.5"
          >
            🔧 Báo sự cố hư hỏng
          </button>
        </div>

        {ticketSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
            <span>✅</span>
            <p>Gửi báo cáo sự cố hư hỏng thành công! Chủ trọ đã được thông báo và sẽ xử lý sớm nhất.</p>
          </div>
        )}

        {/* Tab switcher toolbar */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
          {[
            { id: 'appointments' as const, label: '📅 Lịch Hẹn Xem Phòng', count: appointments.length },
            { id: 'tickets' as const, label: '🛠️ Báo Hỏng & Sửa Chữa', count: tickets.length },
            { id: 'saved' as const, label: '❤️ Phòng Đã Lưu', count: savedRooms.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3.5 px-4 text-xs font-bold relative transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded-full text-slate-300">
                    {tab.count}
                  </span>
                )}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab display contents */}
        <div className="space-y-4">
          
          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((app) => (
                <div key={app.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between gap-4 shadow-xl">
                  <div>
                    <div className="flex justify-between items-start gap-2.5">
                      <span className="font-bold text-xs text-slate-200 line-clamp-1">{app.roomTitle}</span>
                      
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        app.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                        app.status === 'declined' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}>
                        {app.status === 'accepted' ? 'Đã xác nhận' : app.status === 'declined' ? 'Đã từ chối' : 'Chờ phản hồi'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-3 bg-black/25 p-2.5 rounded-lg border border-white/5">
                      🕒 Hẹn gặp: <strong className="text-slate-200">{app.date}</strong> lúc <strong className="text-slate-200">{app.time}</strong>
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1 text-xs">
                    <span className="text-[10px] text-slate-500">Nguồn: Map Hub</span>
                    <Link to="/chat" className="font-bold text-blue-400 hover:text-blue-300">Nhắn tin trao đổi →</Link>
                  </div>
                </div>
              ))}

              {appointments.length === 0 && (
                <div className="col-span-2 text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                  <span className="text-5xl">📭</span>
                  <div className="space-y-1">
                    <p className="text-xs">Bạn chưa đặt lịch hẹn xem phòng nào.</p>
                    <Link to="/explore" className="text-xs font-bold text-blue-400 hover:underline">Khám phá bản đồ ngay</Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TICKETS TAB */}
          {activeTab === 'tickets' && (
            <div className="flex flex-col gap-3">
              {tickets.map((t) => (
                <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col md:flex-row justify-between gap-4 items-start md:items-center shadow-xl">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-200 line-clamp-1">{t.roomTitle}</span>
                      <span className="text-[9px] font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        {t.issueType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 bg-black/20 p-2.5 rounded-lg border border-white/5 italic">"{t.description}"</p>
                    <p className="text-[10px] text-slate-500">Thời gian tạo phiếu: {t.createdAt}</p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                      t.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                      t.status === 'fixing' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 animate-pulse' :
                      'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                      {t.status === 'completed' ? 'Sự cố đã được sửa xong' : t.status === 'fixing' ? 'Đang sửa chữa' : 'Chờ chủ nhà tiếp nhận'}
                    </span>
                  </div>
                </div>
              ))}

              {tickets.length === 0 && (
                <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-2">
                  <span className="text-4xl">🛠️</span>
                  <p className="text-xs">Chưa có sự cố báo hỏng điện nước nào được tạo.</p>
                </div>
              )}
            </div>
          )}

          {/* SAVED TAB */}
          {activeTab === 'saved' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedRooms.map((room) => (
                <div key={room.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex gap-4 shadow-xl">
                  <img src={room.image} alt={room.title} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 truncate">{room.title}</h4>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">📍 {room.address}</p>
                      <p className="text-xs font-black text-emerald-400 mt-1">{(room.price / 1000000).toFixed(1)} triệu / tháng</p>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <Link to="/explore" className="text-blue-400 hover:text-blue-300 font-bold">Bản đồ →</Link>
                      <button 
                        onClick={() => handleRemoveSavedRoom(room.id)}
                        className="text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Bỏ lưu
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {savedRooms.length === 0 && (
                <div className="col-span-2 text-center py-16 text-slate-500 flex flex-col items-center gap-2">
                  <span className="text-4xl">💔</span>
                  <p className="text-xs">Bạn chưa lưu bất kỳ phòng trọ nào.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      <MaintenanceTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
          setTicketSuccess(true);
          setTimeout(() => setTicketSuccess(false), 4000);
        }}
      />
    </div>
  );
}
