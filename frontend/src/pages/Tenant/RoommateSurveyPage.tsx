import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  questionText: string;
  icon: string;
  options: { label: string; value: string; desc?: string }[];
}

const SURVEY_QUESTIONS: Question[] = [
  {
    id: 'sleep',
    questionText: 'Thói quen đi ngủ của bạn như thế nào?',
    icon: '😴',
    options: [
      { label: '🌅 Dậy sớm ngủ sớm', value: 'early', desc: 'Thường thức dậy đón bình minh và đi ngủ trước 23h' },
      { label: '🦉 Cú đêm làm việc khuya', value: 'late', desc: 'Sáng tạo nhất về đêm, thường thức tới sau 1h sáng' },
      { label: '⏰ Linh hoạt bình thường', value: 'flexible', desc: 'Giờ giấc sinh hoạt điều độ, đi ngủ tầm 23h - 1h' }
    ]
  },
  {
    id: 'clean',
    questionText: 'Mức độ gọn gàng ngăn nắp của bạn ra sao?',
    icon: '🧹',
    options: [
      { label: '✨ Chuẩn sạch sẽ tối đa', value: 'strict', desc: 'Dọn dẹp phòng hàng ngày, mọi thứ phải đúng vị trí' },
      { label: '🧺 Ngăn nắp vừa phải', value: 'moderate', desc: 'Dọn dẹp định kỳ cuối tuần, giữ không gian gọn gàng' },
      { label: '👕 Tuỳ hứng thoải mái', value: 'loose', desc: 'Bừa bộn nhẹ không là vấn đề, dọn dẹp khi cần thiết' }
    ]
  },
  {
    id: 'cook',
    questionText: 'Tần suất nấu ăn tại phòng trọ?',
    icon: '🍳',
    options: [
      { label: '🍲 Tự nấu ăn hàng ngày', value: 'daily', desc: 'Thích tự nấu cơm chuẩn bị hộp đồ ăn lành mạnh' },
      { label: '🍕 Thỉnh thoảng nấu ăn', value: 'sometimes', desc: 'Lúc nấu lúc ăn ngoài, tuỳ thuộc lịch học tập' },
      { label: '🚫 Không bao giờ nấu', value: 'never', desc: 'Ăn ngoài tiệm hoặc gọi ship đồ ăn về phòng' }
    ]
  },
  {
    id: 'guests',
    questionText: 'Quy định đón bạn bè, khách ngoài chơi phòng?',
    icon: '🤝',
    options: [
      { label: '🔒 Giới hạn tối đa', value: 'no', desc: 'Hạn chế người lạ vào phòng để đảm bảo an toàn tuyệt đối' },
      { label: '📅 Đón bạn dịp cuối tuần', value: 'weekend', desc: 'Cho phép bạn bè qua chơi, ăn uống học nhóm cuối tuần' },
      { label: '🎉 Thoải mái tự do', value: 'any', desc: 'Chào đón bạn bè bất kỳ lúc nào, tôn trọng sự riêng tư' }
    ]
  },
  {
    id: 'pets',
    questionText: 'Quan điểm về việc nuôi thú cưng (chó, mèo)?',
    icon: '🐱',
    options: [
      { label: '🐾 Rất yêu thích nuôi pet', value: 'like', desc: 'Mong muốn được nuôi hoặc sống cùng chó mèo đáng yêu' },
      { label: '🆗 Không nuôi nhưng không ghét', value: 'neutral', desc: 'Không có nhu cầu nuôi nhưng thoải mái nếu roommate nuôi' },
      { label: '⚠️ Dị ứng lông thú cưng', value: 'dislike', desc: 'Không thể ở chung với thú cưng vì lý do sức khỏe/sở thích' }
    ]
  },
  {
    id: 'budget',
    questionText: 'Ngân sách thuê phòng mong muốn của bạn?',
    icon: '💵',
    options: [
      { label: '💰 Dưới 2 triệu / tháng', value: 'under-2m', desc: 'Tìm phòng trọ ghép giá rẻ tiết kiệm chi phí tối đa' },
      { label: '💳 Từ 2M - 4 triệu / tháng', value: '2m-4m', desc: 'Ngân sách trung bình, tìm phòng trọ khép kín ổn định' },
      { label: '💎 Trên 4 triệu / tháng', value: 'above-4m', desc: 'Muốn ở chung cư cao cấp full đồ, không ngại chi trả' }
    ]
  }
];

export default function RoommateSurveyPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleOptionSelect = (optionValue: string) => {
    const updatedAnswers = { ...answers, [SURVEY_QUESTIONS[currentIdx].id]: optionValue };
    setAnswers(updatedAnswers);

    if (currentIdx < SURVEY_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      localStorage.setItem('roommate_survey_answers', JSON.stringify(updatedAnswers));
      navigate('/tenant/matches');
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const progressPercent = Math.round(((currentIdx + 1) / SURVEY_QUESTIONS.length) * 100);

  return (
    <div className="pt-20 min-h-screen bg-[#080c14] text-white px-4 md:px-8 pb-12 font-sans flex items-center justify-center relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl space-y-8 relative z-10">
        
        {/* Header Progress indicator */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 tracking-wider">
            <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20">📋 KHẢO SÁT LỐI SỐNG</span>
            <span>CÂU {currentIdx + 1} / {SURVEY_QUESTIONS.length}</span>
          </div>
          
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question presentation card */}
        <div className="space-y-6 animate-fade-in" key={currentIdx}>
          <div className="flex items-center gap-4">
            <span className="text-4xl bg-white/5 p-3 rounded-2xl border border-white/10 shadow-lg">{SURVEY_QUESTIONS[currentIdx].icon}</span>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 leading-snug">
              {SURVEY_QUESTIONS[currentIdx].questionText}
            </h2>
          </div>

          <div className="flex flex-col gap-3.5 pt-2">
            {SURVEY_QUESTIONS[currentIdx].options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleOptionSelect(opt.value)}
                className="w-full p-5 rounded-2xl border border-white/5 bg-black/20 text-left hover:bg-white/5 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="font-bold text-sm text-slate-200 group-hover:text-blue-400 transition-colors block">{opt.label}</span>
                  {opt.desc && <span className="text-xs text-slate-500 block leading-normal">{opt.desc}</span>}
                </div>
                <span className="text-xs opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity self-center font-bold">Lựa chọn →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action button footer */}
        <div className="flex justify-between border-t border-white/10 pt-5 mt-4">
          <button
            onClick={handleBack}
            disabled={currentIdx === 0}
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            ← Quay lại câu trước
          </button>
          <span className="text-xs text-slate-500 italic self-center">Dữ liệu được dùng để đối sánh chính xác tương đồng</span>
        </div>

      </div>
    </div>
  );
}
