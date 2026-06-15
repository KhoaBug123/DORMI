
import ChatInterface from '../../components/Chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#080c14] text-white px-6 md:px-12 pb-12 font-sans flex flex-col">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            💬 Hộp Thoại Trực Tuyến
          </h1>
          <p className="text-slate-400 text-sm mt-1">Kết nối tức thời giữa người thuê trọ, chủ nhà và bạn cùng phòng.</p>
        </div>
        
        <ChatInterface />
      </div>
    </div>
  );
}
