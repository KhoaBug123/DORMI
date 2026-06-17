import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import VirtualTour360 from './components/VirtualTour360';
import TourDemoPage from './pages/TourDemoPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import KYCVerificationPage from './pages/Auth/KYCVerificationPage';
import ExploreMapPage from './pages/Tenant/ExploreMapPage';
import LandlordDashboardPage from './pages/Landlord/LandlordDashboardPage';
import CreateRoomPage from './pages/Landlord/CreateRoomPage';
import PremiumListingPage from './pages/Landlord/PremiumListingPage';
import TenantDashboardPage from './pages/Tenant/TenantDashboardPage';
import RoommateSurveyPage from './pages/Tenant/RoommateSurveyPage';
import RoommateMatchesPage from './pages/Tenant/RoommateMatchesPage';
import ChatPage from './pages/Chat/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import RoomDetailPage from './pages/Tenant/RoomDetailPage';

// ---------------------------------------------------------------------------
// Navigation Bar
// ---------------------------------------------------------------------------

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/', label: '🏠 Trang chủ' },
    { to: '/tour-demo', label: '🔮 Xem phòng 360°' },
  ];

  if (isAuthenticated) {
    if (role === 'tenant') {
      navItems.push(
        { to: '/explore', label: '🗺️ Tìm phòng & Bản đồ' },
        { to: '/tenant/dashboard', label: '👤 Dashboard' },
        { to: '/tenant/survey', label: '📋 Khảo sát Roommate' },
        { to: '/tenant/matches', label: '🤝 Ghép Roommate' },
        { to: '/chat', label: '💬 Trò chuyện' }
      );
    } else if (role === 'landlord') {
      navItems.push(
        { to: '/landlord/dashboard', label: '📊 Dashboard' },
        { to: '/landlord/create-room', label: '➕ Đăng tin phòng' },
        { to: '/landlord/premium', label: '💎 Mua VIP' },
        { to: '/chat', label: '💬 Tin nhắn' }
      );
    }
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 60,
        background: 'rgba(8, 12, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          DORMI
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'rgba(148, 163, 184, 0.8)',
            background: 'rgba(96, 165, 250, 0.1)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            borderRadius: 6,
            padding: '2px 6px',
            letterSpacing: '0.05em',
          }}
        >
          PROP-TECH
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? '#60a5fa' : 'rgba(148, 163, 184, 0.9)',
                background: isActive ? 'rgba(96, 165, 250, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(96, 165, 250, 0.25)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Authentication buttons */}
        <div style={{ marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: 8 }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>
                Chào, <strong style={{ color: '#f1f5f9' }}>{user?.name}</strong> 
                {role === 'landlord' && (
                  <span style={{
                    marginLeft: 6,
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: user?.isVerified ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: user?.isVerified ? '#34d399' : '#f87171',
                    border: user?.isVerified ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    {user?.isVerified ? '✓ Đã KYC' : '⚠ Chưa KYC'}
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(248, 113, 113, 0.1)',
                  border: '1px solid rgba(248, 113, 113, 0.25)',
                  color: '#f87171',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Home Page — DORMI landing stub
// ---------------------------------------------------------------------------

function HomePage() {
  const { isAuthenticated, role } = useAuthStore();
  
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #080c14 0%, #0d1a2a 50%, #0a1520 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '80px 24px 40px',
        textAlign: 'center',
      }}
    >
      {/* Hero Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(96, 165, 250, 0.1)',
          border: '1px solid rgba(96, 165, 250, 0.25)',
          borderRadius: 20,
          padding: '6px 16px',
          marginBottom: 28,
          fontSize: 12,
          color: '#93c5fd',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        <span>✨</span>
        <span>Hệ sinh thái Thuê trọ Thông minh đầu tiên cho Sinh viên</span>
      </div>

      {/* Hero Title */}
      <h1
        style={{
          fontSize: 'clamp(40px, 7vw, 72px)',
          fontWeight: 800,
          lineHeight: 1.08,
          marginBottom: 20,
          letterSpacing: '-0.03em',
          color: '#f1f5f9',
        }}
      >
        Trải Nghiệm Phòng Trọ
        <br />
        <span
          style={{
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Với Góc Nhìn 360°
        </span>
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 18,
          color: 'rgba(148, 163, 184, 0.85)',
          maxWidth: 560,
          lineHeight: 1.65,
          marginBottom: 44,
        }}
      >
        DORMI kết nối chủ nhà & sinh viên qua các chuyến tham quan thực tế ảo 3D,
        thuật toán tìm bạn cùng phòng AI, và nhắn tin bảo mật thời gian thực.
      </p>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to="/tour-demo"
          style={{
            textDecoration: 'none',
            padding: '14px 28px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35)',
            transition: 'all 0.2s ease',
            letterSpacing: '0.01em',
          }}
        >
          🔮 Thử Trực Quan 360°
        </Link>
        
        {isAuthenticated ? (
          <Link
            to={role === 'tenant' ? '/explore' : '/landlord/dashboard'}
            style={{
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: 15,
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            Vào Trang Quản Trị →
          </Link>
        ) : (
          <Link
            to="/login"
            style={{
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: 15,
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            Khám Phá Ngay →
          </Link>
        )}
      </div>

      {/* Feature Cards */}
      <div
        id="features"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          maxWidth: 900,
          width: '100%',
          marginTop: 80,
        }}
      >
        {[
          {
            icon: '🔮',
            title: 'Xem Phòng 360°',
            desc: 'Khảo sát mọi góc ngách phòng trọ với ảnh Panorama 360 chất lượng cao ngay tại nhà.',
          },
          {
            icon: '🗺️',
            title: 'Tìm Kiếm Bản Đồ GIS',
            desc: 'Tìm phòng trọ xung quanh trường đại học với khoảng cách và bán kính chính xác.',
          },
          {
            icon: '💬',
            title: 'Trò Chuyện Thời Gian Thực',
            desc: 'Hệ thống nhắn tin tức thời SignalR giúp kết nối nhanh chóng giữa chủ trọ và sinh viên.',
          },
          {
            icon: '🤝',
            title: 'Ghép Bạn Cùng Phòng',
            desc: 'Thuật toán đối sánh lối sống giúp bạn tìm thấy người ở ghép phù hợp nhất.',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: '24px 20px',
              textAlign: 'left',
              backdropFilter: 'blur(8px)',
              transition: 'border-color 0.2s ease',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>{feature.icon}</div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: 8,
              }}
            >
              {feature.title}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(148, 163, 184, 0.75)',
                lineHeight: 1.6,
              }}
            >
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root App component — sets up Router
// ---------------------------------------------------------------------------

export { VirtualTour360 };

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/tour-demo" element={<TourDemoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/room/:id" element={<RoomDetailPage />} />

        {/* Protected Routes for KYC Verification */}
        <Route 
          path="/kyc" 
          element={
            <ProtectedRoute allowedRoles={['landlord']}>
              <KYCVerificationPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Tenant Routes */}
        <Route 
          path="/explore" 
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <ExploreMapPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tenant/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tenant/survey" 
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <RoommateSurveyPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tenant/matches" 
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <RoommateMatchesPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Landlord Routes */}
        <Route 
          path="/landlord/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['landlord']} requireKYC={true}>
              <LandlordDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/landlord/create-room" 
          element={
            <ProtectedRoute allowedRoles={['landlord']} requireKYC={true}>
              <CreateRoomPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/landlord/premium" 
          element={
            <ProtectedRoute allowedRoles={['landlord']} requireKYC={true}>
              <PremiumListingPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected General/Shared Routes (both Tenant & Landlord) */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute allowedRoles={['tenant', 'landlord']}>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
