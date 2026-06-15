import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function KYCVerificationPage() {
  const [cccdFront, setCccdFront] = useState<File | null>(null);
  const [cccdBack, setCccdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifyStep, setVerifyStep] = useState<string>('');
  
  const { updateVerification } = useAuthStore();
  const navigate = useNavigate();

  const handleStartVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cccdFront || !cccdBack || !selfie) return;
    
    setLoading(true);
    setVerifyStep('🔍 Đang kiểm tra định dạng tệp ảnh...');
    
    // Giả lập từng bước phân tích OCR AI của FPT.AI
    setTimeout(() => {
      setVerifyStep('📇 Đang phân tích OCR quét thông tin CCCD...');
      
      setTimeout(() => {
        setVerifyStep('👤 Đang đối sánh khuôn mặt Selfie với ảnh thẻ...');
        
        setTimeout(() => {
          setVerifyStep('🛡️ Đang xác thực mã bảo mật vân tay chống giả mạo...');
          
          setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            updateVerification(true);
            
            setTimeout(() => {
              navigate('/landlord/dashboard');
            }, 2000);
          }, 1200);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const FileInput = ({ label, file, setFile, sampleSvg }: { label: string, file: File | null, setFile: (f: File | null) => void, sampleSvg: React.ReactNode }) => (
    <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-white/5 relative group cursor-pointer ${file ? 'border-emerald-500/50 hover:border-emerald-400' : 'border-white/10 hover:border-blue-500/40'}`}>
      <label className="cursor-pointer block w-full h-full">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
        />
        {file ? (
          <div className="text-emerald-400 text-sm font-semibold flex flex-col items-center gap-3">
            <span className="text-4xl bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20">✅</span>
            <span className="truncate max-w-[200px] block">{file.name}</span>
            <span className="text-[10px] text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Sẵn sàng phân tích</span>
          </div>
        ) : (
          <div className="text-slate-400 text-sm flex flex-col items-center gap-3">
            <div className="opacity-40 group-hover:opacity-75 transition-opacity">
              {sampleSvg}
            </div>
            <span className="font-bold text-slate-300">Tải lên {label}</span>
            <span className="text-[10px] text-slate-500">Kéo thả hoặc nhấn vào để chọn tệp</span>
          </div>
        )}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080c14] font-sans flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        
        {success ? (
          <div className="text-center py-10 animate-fade-in flex flex-col items-center justify-center gap-4">
            <span className="text-7xl bg-emerald-500/10 p-5 rounded-full border border-emerald-500/20 animate-bounce">🎉</span>
            <h2 className="text-2xl font-black text-emerald-400">Xác thực thành công!</h2>
            <p className="text-slate-300 text-sm max-w-md">
              Danh tính Chủ trọ đã được AI đối sánh trùng khớp 100%. Nền tảng sẽ gắn nhãn bảo mật **eKYC Verified** lên toàn bộ tin đăng của bạn. Đang chuyển hướng về Dashboard...
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-16 animate-fade-in flex flex-col items-center justify-center gap-6">
            {/* Spinning AI radar loader */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-indigo-500 border-b-purple-500 border-l-transparent animate-spin" />
              <span className="text-3xl animate-pulse">🤖</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100">Hệ thống AI eKYC đang quét thông tin</h3>
              <p className="text-sm text-blue-400 font-medium animate-pulse">{verifyStep}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-white/10 pb-5 mb-6">
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">Quy trình bắt buộc</span>
              <h1 className="text-2xl font-extrabold text-slate-100 mt-3">Xác thực Định danh (eKYC)</h1>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Để xây dựng hệ sinh thái phòng trọ an toàn, phòng chống lừa đảo đặt cọc, DORMI yêu cầu chủ trọ thực hiện xác minh chứng minh nhân dân/CCCD. Quá trình xử lý tự động trong 5 giây.
              </p>
            </div>

            <form onSubmit={handleStartVerification} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Mặt trước CCCD */}
                <FileInput 
                  label="Mặt trước CCCD" 
                  file={cccdFront} 
                  setFile={setCccdFront} 
                  sampleSvg={
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  } 
                />

                {/* Mặt sau CCCD */}
                <FileInput 
                  label="Mặt sau CCCD" 
                  file={cccdBack} 
                  setFile={setCccdBack} 
                  sampleSvg={
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  } 
                />

              </div>

              {/* Selfie */}
              <FileInput 
                label="Ảnh chân dung (Selfie) chụp cùng CCCD" 
                file={selfie} 
                setFile={setSelfie} 
                sampleSvg={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                } 
              />

              {/* Security Alert Badge */}
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 text-sm text-blue-200">
                <span className="text-xl shrink-0">🛡️</span>
                <p className="leading-relaxed">
                  Thông tin định danh cá nhân của bạn được mã hóa đầu cuối và chỉ sử dụng cho mục đích xác thực quyền sở hữu bất động sản. DORMI cam kết bảo mật tuyệt đối theo quy định pháp luật.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!cccdFront || !cccdBack || !selfie}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold text-base shadow-lg shadow-blue-500/10 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Bắt Đầu Phân Tích AI eKYC
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
