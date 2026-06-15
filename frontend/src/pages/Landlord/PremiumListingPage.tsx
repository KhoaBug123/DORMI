import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PremiumListingPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'vip' | 'verified' | null>(null);
  const [paymentStep, setPaymentStep] = useState<number>(1);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const plans = [
    {
      id: 'verified' as const,
      name: 'Nhãn "Xác thực Uy tín"',
      price: '199.000',
      period: 'trọn đời tin đăng',
      badge: '🛡️ eKYC Verified',
      color: 'border-emerald-500/20 hover:border-emerald-500/50 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04]',
      btnColor: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10',
      description: 'Gắn nhãn xác thực màu xanh lá trên bản đồ GIS và tin đăng. Tăng độ uy tín chống lừa đảo, nâng tỷ lệ sinh viên liên hệ xem phòng lên 2.5 lần.',
      features: [
        'Xác thực thông tin qua eKYC tự động',
        'Huy hiệu bảo vệ màu xanh nổi bật',
        'Lọc tin ưu tiên trên Map Hub tìm phòng',
        'Hỗ trợ hiển thị trên bảng tin nổi bật sinh viên'
      ]
    },
    {
      id: 'vip' as const,
      name: 'Đẩy Tin Lên Top VIP',
      price: '299.000',
      period: '30 ngày hiệu lực',
      badge: '💎 Tin đăng VIP',
      color: 'border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-500/[0.02] hover:bg-indigo-500/[0.04]',
      btnColor: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-indigo-500/10',
      description: 'Cố định tin đăng phòng ở vị trí hàng đầu quanh khu vực trường đại học. Tiếp cận tối đa lượng sinh viên mới nhập học tìm phòng trọ.',
      features: [
        'Huy hiệu vương miện VIP lấp lánh',
        'Cố định top 3 vị trí danh sách tìm kiếm',
        'Tích hợp liên kết xem phòng 360° nổi bật',
        'Báo cáo phân tích số lượng xem tin theo tuần'
      ]
    }
  ];

  const handlePaymentSubmit = () => {
    setLoadingPayment(true);
    setTimeout(() => {
      setLoadingPayment(false);
      setPaymentStep(3);
      
      setTimeout(() => {
        navigate('/landlord/dashboard');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="pt-20 min-h-screen bg-[#080c14] text-white px-4 md:px-8 pb-12 font-sans relative overflow-hidden">
      {/* Background glow radial */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-white/10 pb-6 text-center space-y-3">
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">Dịch vụ đẩy tin</span>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mt-2">
            💎 Gói Dịch Vụ Tin Đăng Cao Cấp
          </h1>
          <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
            Nâng tầm tin đăng phòng trọ của bạn. Tăng tốc độ tiếp cận sinh viên gấp 3 lần và khẳng định uy tín phòng trọ chuẩn sạch.
          </p>
        </div>

        {paymentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`border rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between transition-all duration-300 shadow-xl ${plan.color}`}
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-100 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">{plan.badge}</span>
                  <h3 className="text-lg font-black text-slate-200 mt-4">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.description}</p>
                  
                  <div className="my-6">
                    <span className="text-3xl font-black text-slate-100">{plan.price}đ</span>
                    <span className="text-slate-500 text-xs"> / {plan.period}</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300 border-t border-white/5 pt-4 mb-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setPaymentStep(2);
                  }}
                  className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-lg transition-all ${plan.btnColor}`}
                >
                  Kích hoạt dịch vụ
                </button>
              </div>
            ))}
          </div>
        )}

        {paymentStep === 2 && selectedPlan && (
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
            <div className="border-b border-white/5 pb-3 text-center">
              <h3 className="text-base font-bold text-slate-100">💸 Cổng Thanh Toán Cố Định</h3>
              <p className="text-xs text-slate-400 mt-1">Xác thực giao dịch an toàn và mã hóa thông tin</p>
            </div>
            
            {/* Hóa đơn tóm tắt */}
            <div className="bg-black/30 p-4 rounded-xl space-y-2.5 text-xs text-slate-300 border border-white/5">
              <div className="flex justify-between">
                <span>Dịch vụ đăng ký:</span>
                <strong className="text-white">
                  {selectedPlan === 'vip' ? 'Đẩy tin Top VIP 30 ngày' : 'Nhãn Bảo mật Xác thực'}
                </strong>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2.5 font-bold">
                <span>Tổng số tiền:</span>
                <span className="text-emerald-400 text-sm">
                  {selectedPlan === 'vip' ? '299.000 đ' : '199.000 đ'}
                </span>
              </div>
            </div>

            {/* Giả lập chuyển khoản */}
            <div className="flex flex-col items-center gap-4 border border-white/10 p-5 rounded-xl bg-black/25 text-center">
              <div className="w-32 h-32 bg-white rounded-lg p-2.5 flex items-center justify-center shadow-lg">
                {/* Visual grid representing barcode qr */}
                <div className="text-[7.5px] font-mono leading-none tracking-widest text-black select-none font-bold">
                  ████████████████<br />
                  ██  ██    ██  ██<br />
                  ██  ████  ██  ██<br />
                  ██████  ████████<br />
                  ██  ████  ██  ██<br />
                  ████████████████<br />
                  ██  ██    ██  ██<br />
                  ████████████████
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">QUÉT MÃ QR THANH TOÁN</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Hỗ trợ toàn bộ App Ngân hàng Việt Nam (VietQR) và ví MoMo điện tử.
                </p>
              </div>
            </div>

            {/* Actions button */}
            <div className="flex gap-3 text-xs">
              <button 
                onClick={() => setPaymentStep(1)}
                className="flex-1 py-3 border border-white/10 rounded-xl text-slate-400 font-bold hover:bg-white/5 transition-colors"
              >
                Hủy thanh toán
              </button>
              <button 
                onClick={handlePaymentSubmit}
                disabled={loadingPayment}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loadingPayment ? 'Đang xác minh giao dịch...' : 'Xác nhận Đã Chuyển'}
              </button>
            </div>
          </div>
        )}

        {paymentStep === 3 && (
          <div className="max-w-md mx-auto text-center py-12 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-fade-in flex flex-col items-center gap-4 shadow-2xl">
            <span className="text-6xl bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">💎</span>
            <h2 className="text-2xl font-black text-emerald-400">Thanh Toán Hoàn Tất!</h2>
            <p className="text-slate-300 text-xs leading-relaxed max-w-xs">
              Dịch vụ tin đăng VIP/Xác thực đã được kích hoạt thành công. Đang cập nhật lại tin đăng và chuyển hướng về Dashboard...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
