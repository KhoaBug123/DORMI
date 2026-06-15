import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEquirectangularRatio } from '../../utils/imageValidation';

export default function CreateRoomPage() {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('single');
  const [university, setUniversity] = useState('all');
  const [description, setDescription] = useState('');
  
  // Facilities State
  const [wifi, setWifi] = useState(false);
  const [ac, setAc] = useState(false);
  const [parking, setParking] = useState(false);
  const [privateBath, setPrivateBath] = useState(false);

  // File Upload State
  const [normalPhoto, setNormalPhoto] = useState<File | null>(null);
  const [photo360, setPhoto360] = useState<File | null>(null);
  const [normalPreview, setNormalPreview] = useState<string>('');
  
  // Validation/Submit Status
  const [error360, setError360] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNormalPhotoChange = (file: File | null) => {
    if (!file) {
      setNormalPhoto(null);
      setNormalPreview('');
      return;
    }
    setNormalPhoto(file);
    const objectUrl = URL.createObjectURL(file);
    setNormalPreview(objectUrl);
  };

  const handle360Change = async (file: File | null) => {
    if (!file) {
      setPhoto360(null);
      setError360(null);
      return;
    }

    const isValid = await validateEquirectangularRatio(file);
    if (!isValid) {
      setError360('❌ Tỷ lệ ảnh 360° không đúng tiêu chuẩn 2:1 (ví dụ: 4096x2048). Vui lòng chọn ảnh Panorama hợp lệ.');
      setPhoto360(null);
    } else {
      setError360(null);
      setPhoto360(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập lưu tin đăng
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/landlord/dashboard');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="pt-20 min-h-screen bg-[#080c14] text-white px-4 md:px-8 lg:px-12 pb-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {success ? (
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-center py-12 animate-fade-in flex flex-col items-center gap-4">
            <span className="text-6xl bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">🎉</span>
            <h2 className="text-2xl font-black text-emerald-400">Đăng Tin Thành Công!</h2>
            <p className="text-slate-300 text-sm">Tin đăng phòng trọ của bạn đang được duyệt tự động. Đang chuyển hướng về Dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cột trái: Form tạo tin (8 cols) */}
            <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">Đăng tin cho thuê</span>
                <h1 className="text-2xl font-black text-slate-100 mt-3">Đăng Tin Phòng Trọ Mới</h1>
                <p className="text-slate-400 text-xs mt-1">Cung cấp đầy đủ thông tin để thu hút sinh viên và tiếp cận roommate nhanh nhất.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Tiêu đề */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tiêu đề tin đăng</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Phòng trọ studio khép kín gác xép, full đồ gần HUST"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>

                {/* Giá + Địa chỉ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Giá thuê (VND/Tháng)</label>
                    <input
                      type="number"
                      required
                      placeholder="VD: 3500000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Địa chỉ chi tiết</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Số 12 Tạ Quang Bửu, Hai Bà Trưng"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Phân vùng GIS + Loại phòng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Loại hình phòng</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="single">Phòng đơn</option>
                      <option value="shared">Phòng ở ghép</option>
                      <option value="apartment">Căn hộ khép kín</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Trường đại học gần nhất</label>
                    <select
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="all">Không phân vùng</option>
                      <option value="bách khoa">ĐH Bách Khoa HN</option>
                      <option value="ngoại thương">ĐH Ngoại Thương</option>
                      <option value="kinh tế quốc dân">ĐH Kinh tế Quốc dân</option>
                      <option value="quốc gia">ĐHQG Hà Nội (Cầu Giấy)</option>
                    </select>
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Mô tả phòng & Chi phí phụ</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mô tả các chi tiết khác như tiền điện, nước, internet, quy định thú cưng, giờ giấc..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 resize-none placeholder:text-slate-600"
                  />
                </div>

                {/* Tiện ích check */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tiện ích đi kèm</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { label: 'Free Wi-Fi', val: wifi, set: setWifi },
                      { label: 'Điều hòa (AC)', val: ac, set: setAc },
                      { label: 'Bãi đỗ xe', val: parking, set: setParking },
                      { label: 'WC khép kín', val: privateBath, set: setPrivateBath },
                    ].map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => f.set(!f.val)}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all ${f.val ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'}`}
                      >
                        {f.val ? '✓ ' : ''}{f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Ảnh chính diện 2D</label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center bg-black/10 hover:border-blue-500/40 transition-colors">
                      <label className="cursor-pointer block w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleNormalPhotoChange(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        {normalPhoto ? (
                          <span className="text-xs text-emerald-400 truncate max-w-[150px] block mx-auto">✅ {normalPhoto.name}</span>
                        ) : (
                          <span className="text-xs text-slate-500 block">Chọn tệp hình ảnh chính</span>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      Ảnh VR 360° <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">USP</span>
                    </label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center bg-black/10 hover:border-purple-500/40 transition-colors">
                      <label className="cursor-pointer block w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handle360Change(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        {photo360 ? (
                          <span className="text-xs text-emerald-400 truncate max-w-[150px] block mx-auto">✅ {photo360.name}</span>
                        ) : (
                          <span className="text-xs text-slate-500 block">Tỷ lệ 2:1 Panorama</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                {error360 && <p className="text-xs text-rose-400 mt-1">{error360}</p>}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold text-base shadow-lg shadow-blue-500/10 hover:opacity-95 active:scale-[0.99] transition-all"
                >
                  {loading ? 'Đang đăng thông tin...' : 'Tạo Tin Đăng Cho Thuê'}
                </button>
              </form>
            </div>

            {/* Cột phải: Live Card Preview (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bản xem trước trực tiếp (Live Preview)</span>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40">
                {/* Header preview image */}
                <div className="h-52 bg-black/40 relative flex items-center justify-center overflow-hidden">
                  {normalPreview ? (
                    <img src={normalPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-600">
                      <span className="text-5xl block mb-2">🖼️</span>
                      <span className="text-xs">Chưa tải ảnh lên</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                    🛡️ eKYC Verified
                  </span>
                  {photo360 && (
                    <span className="absolute top-3 right-3 bg-purple-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md">
                      🔮 Có 360° Tour
                    </span>
                  )}
                </div>

                {/* Body details */}
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-100 line-clamp-1">{title || 'Tiêu đề phòng trọ của bạn'}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">📍 {address || 'Địa chỉ liên hệ cho thuê'}</p>
                    {university !== 'all' && (
                      <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded mt-2 inline-block">
                        ⚡ Gần {university.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Amenities badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {wifi && <span className="text-[9px] font-bold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded">Wi-Fi Free</span>}
                    {ac && <span className="text-[9px] font-bold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded">Điều hòa</span>}
                    {parking && <span className="text-[9px] font-bold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded">Bãi đỗ xe</span>}
                    {privateBath && <span className="text-[9px] font-bold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded">WC khép kín</span>}
                    {!wifi && !ac && !parking && !privateBath && (
                      <span className="text-[9px] font-bold text-slate-500 italic">Chưa chọn tiện ích nào</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                    <div>
                      <span className="text-xl font-black text-emerald-400">
                        {price ? (Number(price) / 1000000).toFixed(1) : '0.0'} triệu
                      </span>
                      <span className="text-slate-500 text-[10px]">/tháng</span>
                    </div>

                    <div className="flex gap-1.5">
                      {photo360 && (
                        <span className="px-2.5 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-xs font-bold">
                          🔮 360°
                        </span>
                      )}
                      <span className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/10">
                        Đặt lịch
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
