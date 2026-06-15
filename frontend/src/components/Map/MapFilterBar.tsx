import { useState } from 'react';

export interface FilterState {
  searchQuery: string;
  university: string;
  radius: number; // in meters
  priceRange: string;
  roomType: string;
  onlyVerified: boolean;
  amenities: {
    wifi: boolean;
    ac: boolean;
    parking: boolean;
    privateBathroom: boolean;
  };
}

interface MapFilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function MapFilterBar({ onFilterChange }: MapFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    university: 'all',
    radius: 1000,
    priceRange: 'all',
    roomType: 'all',
    onlyVerified: false,
    amenities: {
      wifi: false,
      ac: false,
      parking: false,
      privateBathroom: false,
    },
  });

  const handleChange = (key: keyof FilterState, value: any) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleAmenityChange = (amenity: keyof FilterState['amenities']) => {
    const updatedAmenities = {
      ...filters.amenities,
      [amenity]: !filters.amenities[amenity],
    };
    const updated = { ...filters, amenities: updatedAmenities };
    setFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-slate-100 flex flex-col gap-5">
      <div className="border-b border-white/10 pb-3">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          🔍 Bộ Lọc Tìm Kiếm GIS
        </h3>
        <p className="text-xs text-slate-400 mt-1">Tìm kiếm tối ưu vị trí quanh trường đại học</p>
      </div>

      {/* Tìm kiếm text */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Từ khóa tìm kiếm
        </label>
        <input
          type="text"
          placeholder="Nhập tên đường, khu vực..."
          value={filters.searchQuery}
          onChange={(e) => handleChange('searchQuery', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Chọn trường đại học & Bán kính (GIS Simulation) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Đại học lân cận
          </label>
          <select
            value={filters.university}
            onChange={(e) => handleChange('university', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Tất cả khu vực</option>
            <option value="bách khoa">ĐH Bách Khoa HN</option>
            <option value="quốc gia">ĐHQG Hà Nội (Cầu Giấy)</option>
            <option value="ngoại thương">ĐH Ngoại Thương</option>
            <option value="kinh tế quốc dân">ĐH Kinh tế Quốc dân</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Bán kính tối đa
          </label>
          <select
            value={filters.radius}
            onChange={(e) => handleChange('radius', Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="500">500 m</option>
            <option value="1000">1.0 km</option>
            <option value="2000">2.0 km</option>
            <option value="5000">5.0 km</option>
          </select>
        </div>
      </div>

      {/* Khoảng giá & Loại phòng */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Mức giá thuê
          </label>
          <select
            value={filters.priceRange}
            onChange={(e) => handleChange('priceRange', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Tất cả mức giá</option>
            <option value="under-2m">Dưới 2 triệu</option>
            <option value="2m-4m">2M - 4 triệu</option>
            <option value="4m-6m">4M - 6 triệu</option>
            <option value="above-6m">Trên 6 triệu</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Loại phòng trọ
          </label>
          <select
            value={filters.roomType}
            onChange={(e) => handleChange('roomType', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Tất cả loại hình</option>
            <option value="single">Phòng đơn</option>
            <option value="shared">Ở ghép</option>
            <option value="apartment">Căn hộ khép kín</option>
          </select>
        </div>
      </div>

      {/* Checkbox KYC Chủ trọ */}
      <div className="flex items-center gap-3 py-1 border-t border-b border-white/5">
        <input
          type="checkbox"
          id="verified-landlord"
          checked={filters.onlyVerified}
          onChange={(e) => handleChange('onlyVerified', e.target.checked)}
          className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 bg-black/30 border-white/10 cursor-pointer"
        />
        <label htmlFor="verified-landlord" className="text-sm text-slate-300 font-semibold cursor-pointer select-none flex items-center gap-1.5">
          🛡️ Chủ trọ đã KYC xác thực
        </label>
      </div>

      {/* Tiện ích phòng */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Tiện ích đi kèm
        </label>
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.amenities.wifi}
              onChange={() => handleAmenityChange('wifi')}
              className="w-3.5 h-3.5 rounded text-blue-500 focus:ring-blue-500 bg-black/30 border-white/10"
            />
            Wi-Fi Free
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.amenities.ac}
              onChange={() => handleAmenityChange('ac')}
              className="w-3.5 h-3.5 rounded text-blue-500 focus:ring-blue-500 bg-black/30 border-white/10"
            />
            Điều hòa (AC)
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.amenities.parking}
              onChange={() => handleAmenityChange('parking')}
              className="w-3.5 h-3.5 rounded text-blue-500 focus:ring-blue-500 bg-black/30 border-white/10"
            />
            Bãi đỗ xe
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.amenities.privateBathroom}
              onChange={() => handleAmenityChange('privateBathroom')}
              className="w-3.5 h-3.5 rounded text-blue-500 focus:ring-blue-500 bg-black/30 border-white/10"
            />
            WC khép kín
          </label>
        </div>
      </div>
    </div>
  );
}
