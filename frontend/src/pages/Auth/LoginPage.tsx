import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      login('mock-jwt-token', role, {
        id: role === 'tenant' ? 't-1' : 'l-1',
        name: role === 'tenant' ? 'Tân Sinh Viên' : 'Chủ Trọ Uy Tín',
        email,
        isVerified: role === 'landlord' ? false : undefined
      });
      setLoading(false);
      navigate(role === 'tenant' ? '/' : '/kyc');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#080c14] font-sans flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-5xl bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px] relative z-10">
        
        {/* Left Side: Brand Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/20 p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8 text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              DORMI <span className="text-xs text-blue-300 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">PROP-TECH</span>
            </Link>
            <div className="space-y-6 mt-8">
              <h2 className="text-3xl font-extrabold text-slate-100 leading-tight">
                Tìm phòng trọ lý tưởng trong nháy mắt.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Trải nghiệm xem phòng 3D thực tế ảo, đối sánh roommate AI và giao dịch an toàn chỉ trên một nền tảng.
              </p>
            </div>
          </div>

          <div className="hidden lg:block space-y-4">
            {[
              { icon: '🔮', label: 'Xem phòng 360° Panorama' },
              { icon: '🗺️', label: 'Bản đồ bán kính trường học' },
              { icon: '🤝', label: 'Ghép roommate tương thích' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-xl bg-white/5 p-2 rounded-lg border border-white/5">{f.icon}</span>
                <span className="font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">Chào mừng trở lại</h1>
            <p className="text-sm text-slate-400 mt-1">Đăng nhập tài khoản của bạn để tiếp tục trải nghiệm</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Select Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Vai trò của bạn</label>
              <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    role === 'tenant'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🎓 Sinh Viên Thuê Phòng
                </button>
                <button
                  type="button"
                  onClick={() => setRole('landlord')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    role === 'landlord'
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🏠 Chủ Trọ Đăng Tin
                </button>
              </div>
            </div>

            {/* Email field */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Địa chỉ Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu bảo mật</label>
                <Link to="#" className="text-xs text-blue-400 hover:underline">Quên mật khẩu?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xác thực bảo mật...' : 'Đăng Nhập Ngay'}
            </button>
          </form>

          <div className="text-center mt-8 text-sm text-slate-400 border-t border-white/5 pt-6">
            Chưa tham gia hệ sinh thái?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold ml-1 hover:underline">
              Tạo tài khoản mới
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
