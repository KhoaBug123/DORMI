import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons workarounds for Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface RoomListing {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
  type: 'single' | 'shared' | 'apartment';
  university: string;
  distance: number;
  isVerified: boolean;
  image: string;
  amenities: {
    wifi: boolean;
    ac: boolean;
    parking: boolean;
    privateBathroom: boolean;
  };
  landlord: {
    name: string;
  };
}

const MOCK_ROOMS: RoomListing[] = [
  {
    id: 'r-1',
    title: 'Phòng Trọ Studio 360° Gần ĐH Bách Khoa',
    address: 'Số 12 Ngõ 40 Tạ Quang Bửu, Hai Bà Trưng, Hà Nội',
    lat: 21.0085,
    lng: 105.8455,
    price: 4500000,
    type: 'single',
    university: 'bách khoa',
    distance: 300,
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, ac: true, parking: true, privateBathroom: true },
    landlord: { name: 'Nguyễn Văn Hùng' }
  },
  {
    id: 'r-2',
    title: 'Nhà Ở Ghép Homestay Giá Rẻ NEU',
    address: 'Số 8 Ngõ Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội',
    lat: 21.0022,
    lng: 105.8410,
    price: 1800000,
    type: 'shared',
    university: 'kinh tế quốc dân',
    distance: 400,
    isVerified: false,
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, ac: false, parking: true, privateBathroom: true },
    landlord: { name: 'Trần Thị Mai' }
  },
  {
    id: 'r-3',
    title: 'Căn Hộ Mini Full Đồ Trần Duy Hưng',
    address: 'Ngõ 110 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    lat: 21.0125,
    lng: 105.7995,
    price: 6500000,
    type: 'apartment',
    university: 'ngoại thương',
    distance: 1200,
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, ac: true, parking: true, privateBathroom: true },
    landlord: { name: 'Lê Hoàng Minh' }
  },
  {
    id: 'r-4',
    title: 'Phòng Trọ Sinh Viên Cầu Giấy',
    address: 'Số 45 Ngõ 199 Hồ Tùng Mậu, Cầu Giấy, Hà Nội',
    lat: 21.0370,
    lng: 105.7820,
    price: 2500000,
    type: 'single',
    university: 'quốc gia',
    distance: 900,
    isVerified: false,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, ac: false, parking: true, privateBathroom: false },
    landlord: { name: 'Phạm Đức Anh' }
  },
  {
    id: 'r-5',
    title: 'Phòng Trọ Gác Xép Nguyễn Trãi',
    address: 'Ngõ 328 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    lat: 20.9995,
    lng: 105.8120,
    price: 3200000,
    type: 'single',
    university: 'ngoại thương',
    distance: 1500,
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, ac: true, parking: false, privateBathroom: true },
    landlord: { name: 'Nguyễn Thị Hoa' }
  },
  {
    id: 'r-6',
    title: 'Chung Cư Mini Cao Cấp Giải Phóng',
    address: 'Ngõ 280 Giải Phóng, Phương Liệt, Thanh Xuân, Hà Nội',
    lat: 20.9940,
    lng: 105.8420,
    price: 5500000,
    type: 'apartment',
    university: 'kinh tế quốc dân',
    distance: 1100,
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, ac: true, parking: true, privateBathroom: true },
    landlord: { name: 'Phùng Thế Long' }
  }
];

function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

export default function ExploreMapPage() {
  // Trạng thái bộ lọc tích hợp dạng hàng ngang cực gọn
  const [searchQuery, setSearchQuery] = useState('');
  const [university, setUniversity] = useState('all');
  const [radius, setRadius] = useState(1000);
  const [priceRange, setPriceRange] = useState('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [wifi, setWifi] = useState(false);
  const [ac, setAc] = useState(false);
  const [parking, setParking] = useState(false);
  const [privateBath, setPrivateBath] = useState(false);

  // States khác
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0062, 105.8431]);
  const [selectedRoom, setSelectedRoom] = useState<RoomListing | null>(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState<string | null>(null);
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false);

  const filteredRooms = useMemo(() => {
    return MOCK_ROOMS.filter((room) => {
      if (searchQuery && !room.title.toLowerCase().includes(searchQuery.toLowerCase()) && !room.address.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (university !== 'all' && room.university !== university) {
        return false;
      }
      if (university !== 'all' && room.distance > radius) {
        return false;
      }
      if (priceRange !== 'all') {
        if (priceRange === 'under-2m' && room.price >= 2000000) return false;
        if (priceRange === '2m-4m' && (room.price < 2000000 || room.price > 4000000)) return false;
        if (priceRange === '4m-6m' && (room.price < 4000000 || room.price > 6000000)) return false;
        if (priceRange === 'above-6m' && room.price <= 6000000) return false;
      }
      if (onlyVerified && !room.isVerified) {
        return false;
      }
      if (wifi && !room.amenities.wifi) return false;
      if (ac && !room.amenities.ac) return false;
      if (parking && !room.amenities.parking) return false;
      if (privateBath && !room.amenities.privateBathroom) return false;

      return true;
    });
  }, [searchQuery, university, radius, priceRange, onlyVerified, wifi, ac, parking, privateBath]);

  const handleBookAppointment = (roomId: string, title: string) => {
    const currentApps = JSON.parse(localStorage.getItem('appointments') || '[]');
    const newApp = {
      id: `app-${Date.now()}`,
      roomId,
      roomTitle: title,
      date: new Date().toLocaleDateString('vi-VN'),
      time: '14:00',
      status: 'pending',
    };
    localStorage.setItem('appointments', JSON.stringify([...currentApps, newApp]));

    setAppointmentSuccess(title);
    setTimeout(() => setAppointmentSuccess(null), 3000);
  };

  const createAirbnbMarker = (price: number, isVerified: boolean) => {
    return L.divIcon({
      html: `
        <div class="px-2.5 py-1 rounded-lg text-xs font-black text-white border transition-all scale-100 hover:scale-110 flex items-center gap-1 shadow-lg cursor-pointer"
             style="background: ${isVerified ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'};
                    border-color: ${isVerified ? '#34d399' : '#60a5fa'};">
          <span>${isVerified ? '🛡️' : '🏠'}</span>
          <span>${(price / 1000000).toFixed(1)}M</span>
        </div>
      `,
      className: 'custom-price-marker',
      iconSize: [65, 26],
      iconAnchor: [32, 13]
    });
  };

  return (
    <div className="pt-[60px] min-h-screen bg-[#080c14] text-white flex flex-col font-sans h-screen overflow-hidden">
      
      {/* 1. THANH BỘ LỌC NGANG CAO CẤP (Horizontal Filter Toolbar) */}
      <div className="h-[64px] bg-[#0d1424] border-b border-white/10 px-6 flex items-center justify-between gap-4 z-20 shrink-0">
        
        {/* Tìm kiếm nhanh */}
        <div className="flex-1 max-w-xs relative">
          <input
            type="text"
            placeholder="Nhập đường, khu vực..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          <span className="absolute left-3 top-2.5 opacity-40 text-xs">🔍</span>
        </div>

        {/* Cụm bộ lọc ngang */}
        <div className="flex items-center gap-3">
          
          {/* Lọc Trường Học */}
          <div className="flex items-center bg-black/30 border border-white/10 rounded-xl px-2 py-1">
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">📍 Gần Trường ĐH</option>
              <option value="bách khoa">Bách Khoa HN</option>
              <option value="kinh tế quốc dân">ĐH Kinh Tế QD</option>
              <option value="ngoại thương">ĐH Ngoại Thương</option>
              <option value="quốc gia">ĐHQG Cầu Giấy</option>
            </select>

            {university !== 'all' && (
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="bg-transparent text-[11px] text-blue-400 border-l border-white/10 ml-2 pl-2 focus:outline-none cursor-pointer"
              >
                <option value="500">500m</option>
                <option value="1000">1.0km</option>
                <option value="2000">2.0km</option>
                <option value="5000">5.0km</option>
              </select>
            )}
          </div>

          {/* Lọc Giá Thuê */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">💰 Tất cả mức giá</option>
            <option value="under-2m">Dưới 2 triệu</option>
            <option value="2m-4m">2M - 4 triệu</option>
            <option value="4m-6m">4M - 6 triệu</option>
            <option value="above-6m">Trên 6 triệu</option>
          </select>

          {/* Lọc Chủ trọ KYC */}
          <button
            onClick={() => setOnlyVerified(!onlyVerified)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              onlyVerified 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            🛡️ Chủ trọ KYC
          </button>

          {/* Popover Tiện ích */}
          <div className="relative">
            <button
              onClick={() => setShowAmenitiesDropdown(!showAmenitiesDropdown)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                wifi || ac || parking || privateBath
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              ⚙️ Tiện ích
              {(wifi ? 1 : 0) + (ac ? 1 : 0) + (parking ? 1 : 0) + (privateBath ? 1 : 0) > 0 && (
                <span className="text-[9px] bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-black">
                  {(wifi ? 1 : 0) + (ac ? 1 : 0) + (parking ? 1 : 0) + (privateBath ? 1 : 0)}
                </span>
              )}
            </button>

            {showAmenitiesDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0d1424] border border-white/10 rounded-xl p-4 shadow-xl z-30 space-y-2.5">
                {[
                  { label: 'Wi-Fi Free', val: wifi, set: setWifi },
                  { label: 'Điều hòa (AC)', val: ac, set: setAc },
                  { label: 'Bãi đỗ xe', val: parking, set: setParking },
                  { label: 'WC khép kín', val: privateBath, set: setPrivateBath }
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={() => item.set(!item.val)}
                      className="rounded text-blue-500 focus:ring-blue-500 bg-black/40 border-white/10 cursor-pointer w-4.5 h-4.5"
                    />
                    {item.label}
                  </label>
                ))}
                <div className="border-t border-white/5 pt-2 flex justify-end">
                  <button 
                    onClick={() => setShowAmenitiesDropdown(false)}
                    className="text-[10px] bg-blue-500 text-white font-bold px-2.5 py-1 rounded-md"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 2. KHU VỰC CHÍNH: DANH SÁCH + BẢN ĐỒ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Cột trái: Thẻ phòng trọ */}
        <div className="w-full md:w-[480px] flex flex-col p-4 overflow-y-auto shrink-0 h-full bg-[#080c14] space-y-4">
          
          {appointmentSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-fade-in shrink-0">
              <span>🎉</span>
              <p>Đặt lịch xem phòng <strong>{appointmentSuccess}</strong> thành công! Check lịch hẹn tại Dashboard.</p>
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Tìm thấy <strong className="text-white">{filteredRooms.length}</strong> phòng phù hợp</span>
            <span>📍 Hà Nội, VN</span>
          </div>

          <div className="space-y-3">
            {filteredRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    setMapCenter([room.lat, room.lng]);
                  }}
                  className={`group cursor-pointer p-3.5 bg-white/5 border rounded-2xl flex gap-4 transition-all duration-300 hover:bg-white/[0.08] ${
                    isSelected ? 'border-blue-500 ring-1 ring-blue-500/30 bg-white/[0.08]' : 'border-white/10'
                  }`}
                >
                  {/* Image wrap */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                    <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {room.isVerified && (
                      <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                        🛡️ Verified
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">{room.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">📍 {room.address}</p>
                      
                      {/* University tag */}
                      {room.university !== 'all' && (
                        <p className="text-[9px] text-blue-300 font-bold mt-1.5 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20 inline-block">
                          ⚡ Gần {room.university.toUpperCase()}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <span className="text-base font-black text-emerald-400">{(room.price / 1000000).toFixed(1)} triệu</span>
                        <span className="text-slate-500 text-[9px]">/tháng</span>
                      </div>

                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to="/tour-demo"
                          className="p-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-[10px] font-bold hover:bg-purple-500 hover:text-white transition-colors"
                        >
                          🔮 360°
                        </Link>
                        <button
                          onClick={() => handleBookAppointment(room.id, room.title)}
                          className="px-2.5 py-1.5 bg-blue-500 text-white rounded-lg text-[10px] font-bold hover:bg-blue-600 shadow-md transition-colors"
                        >
                          Đặt lịch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRooms.length === 0 && (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                <span className="text-5xl">🧭</span>
                <p className="text-xs">Không tìm thấy phòng trọ nào phù hợp với bộ lọc.</p>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Leaflet Map Container */}
        <div className="flex-1 h-full relative bg-black/40">
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
            className="z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeMapView center={mapCenter} />

            {filteredRooms.map((room) => (
              <Marker
                key={room.id}
                position={[room.lat, room.lng]}
                icon={createAirbnbMarker(room.price, room.isVerified)}
                eventHandlers={{
                  click: () => {
                    setSelectedRoom(room);
                    setMapCenter([room.lat, room.lng]);
                  }
                }}
              >
                <Popup>
                  <div className="w-56 p-1 text-slate-800 font-sans">
                    <img src={room.image} alt={room.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                    <div className="flex justify-between items-start gap-1 mb-1">
                      <h5 className="font-bold text-xs line-clamp-1">{room.title}</h5>
                      {room.isVerified && <span className="bg-emerald-500 text-white text-[8px] px-1 rounded">🛡️ KYC</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mb-2">📍 {room.address}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-600 font-extrabold text-sm">{(room.price / 1000000).toFixed(1)}M / tháng</span>
                      <Link 
                        to="/tour-demo" 
                        className="px-2 py-1 bg-purple-600 text-white text-[9px] font-bold rounded hover:bg-purple-700 no-underline"
                      >
                        Xem 360°
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>

    </div>
  );
}
