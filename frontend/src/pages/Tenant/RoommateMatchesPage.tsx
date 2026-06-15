import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface RoommateCandidate {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  university: string;
  description: string;
  answers: {
    sleep: string;
    clean: string;
    cook: string;
    guests: string;
    pets: string;
    budget: string;
  };
}

const MOCK_CANDIDATES: RoommateCandidate[] = [
  {
    id: 'cand-1',
    name: 'Đặng Tuấn Anh',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    gender: 'male',
    age: 19,
    university: 'ĐH Bách Khoa HN',
    description: 'Thân thiện, hòa đồng, sạch sẽ. Mình học Điện tử viễn thông, đang tìm bạn ghép cùng để chia phòng quanh Tạ Quang Bửu.',
    answers: {
      sleep: 'early',
      clean: 'strict',
      cook: 'sometimes',
      guests: 'no',
      pets: 'neutral',
      budget: '2m-4m'
    }
  },
  {
    id: 'cand-2',
    name: 'Nguyễn Tiến Đạt',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    gender: 'male',
    age: 18,
    university: 'ĐH Bách Khoa HN',
    description: 'Tân sinh viên khoa CNTT, đam mê code xuyên màn đêm. Mình ngủ muộn nên tìm bạn cùng tần số thoải mái giờ giấc.',
    answers: {
      sleep: 'late',
      clean: 'moderate',
      cook: 'never',
      guests: 'any',
      pets: 'like',
      budget: '2m-4m'
    }
  },
  {
    id: 'cand-3',
    name: 'Trần Minh Thu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    gender: 'female',
    age: 19,
    university: 'ĐH Ngoại Thương',
    description: 'Ưu tiên phòng trọ sạch sẽ ngăn nắp. Mình thích nấu ăn tại phòng, tôn trọng không gian riêng tư của bạn cùng phòng.',
    answers: {
      sleep: 'early',
      clean: 'strict',
      cook: 'daily',
      guests: 'no',
      pets: 'dislike',
      budget: 'above-4m'
    }
  },
  {
    id: 'cand-4',
    name: 'Hoàng Quốc Bảo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    gender: 'male',
    age: 18,
    university: 'ĐH Kinh tế Quốc dân',
    description: 'Tìm bạn vui tính ở ghép. Mình hay tham gia hoạt động đoàn đội, thích nuôi mèo và nấu ăn đơn giản.',
    answers: {
      sleep: 'flexible',
      clean: 'moderate',
      cook: 'sometimes',
      guests: 'weekend',
      pets: 'like',
      budget: '2m-4m'
    }
  },
  {
    id: 'cand-5',
    name: 'Phạm Khánh Linh',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    gender: 'female',
    age: 18,
    university: 'ĐHQG Hà Nội',
    description: 'Tính cách khép kín nhưng hòa nhã. Mình muốn tìm một bạn nữ ở ghép share phòng chung cư mini quanh khu Cầu Giấy.',
    answers: {
      sleep: 'flexible',
      clean: 'strict',
      cook: 'sometimes',
      guests: 'no',
      pets: 'neutral',
      budget: '2m-4m'
    }
  }
];

interface MatchedRoommate extends RoommateCandidate {
  matchPercentage: number;
  matchingKeys: string[];
}

export default function RoommateMatchesPage() {
  const navigate = useNavigate();
  const [userAnswers, setUserAnswers] = useState<Record<string, string> | null>(null);
  const [matches, setMatches] = useState<MatchedRoommate[]>([]);
  
  // Lọc thêm theo Giới tính và Trường học
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [universitySearch, setUniversitySearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('roommate_survey_answers');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserAnswers(parsed);
      calculateMatches(parsed);
    }
  }, []);

  const calculateMatches = (answers: Record<string, string>) => {
    const computedMatches: MatchedRoommate[] = MOCK_CANDIDATES.map((cand) => {
      let matchCount = 0;
      const matchingKeys: string[] = [];
      const keys = Object.keys(cand.answers) as (keyof typeof cand.answers)[];
      
      keys.forEach((key) => {
        if (cand.answers[key] === answers[key]) {
          matchCount++;
          if (key === 'sleep') matchingKeys.push('Giờ ngủ');
          if (key === 'clean') matchingKeys.push('Ngăn nắp');
          if (key === 'cook') matchingKeys.push('Nấu ăn');
          if (key === 'guests') matchingKeys.push('Đón bạn');
          if (key === 'pets') matchingKeys.push('Thú cưng');
          if (key === 'budget') matchingKeys.push('Ngân sách');
        }
      });

      const matchPercentage = Math.round((matchCount / keys.length) * 100);
      return {
        ...cand,
        matchPercentage,
        matchingKeys
      };
    });

    computedMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    setMatches(computedMatches);
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((cand) => {
      if (genderFilter !== 'all' && cand.gender !== genderFilter) return false;
      if (universitySearch && !cand.university.toLowerCase().includes(universitySearch.toLowerCase())) return false;
      return true;
    });
  }, [matches, genderFilter, universitySearch]);

  const handleStartChat = (candId: string, candName: string) => {
    const activeContact = { id: candId, name: candName, isRoommate: true };
    localStorage.setItem('chat_active_contact', JSON.stringify(activeContact));
    navigate('/chat');
  };

  if (!userAnswers) {
    return (
      <div className="pt-20 min-h-screen bg-[#080c14] text-white px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md text-center space-y-6">
          <span className="text-6xl block">📋</span>
          <h2 className="text-xl font-bold text-slate-100">Chưa Hoàn Thành Khảo Sát</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Để sử dụng thuật toán đối sánh lối sống AI tìm kiếm bạn cùng phòng phù hợp nhất, vui lòng hoàn tất khảo sát sinh hoạt ban đầu.
          </p>
          <Link
            to="/tenant/survey"
            className="block w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl text-xs hover:opacity-95 shadow-md shadow-blue-500/10"
          >
            Làm khảo sát ngay (2 phút)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-[#080c14] text-white px-4 md:px-8 lg:px-12 pb-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">Đăng tin ghép phòng</span>
            <h1 className="text-2xl font-black text-slate-100 mt-3">Gợi Ý Roommate Phù Hợp</h1>
            <p className="text-slate-400 text-xs mt-1">Thuật toán tự động đối sánh mức độ tương thích thói quen sinh hoạt.</p>
          </div>
          <Link
            to="/tenant/survey"
            className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-300 transition-colors"
          >
            🔄 Làm lại khảo sát
          </Link>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-[#0d1424] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 p-0.5 bg-black/40 border border-white/5 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${genderFilter === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Tất cả giới tính
            </button>
            <button
              onClick={() => setGenderFilter('male')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${genderFilter === 'male' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🙋‍♂️ Nam
            </button>
            <button
              onClick={() => setGenderFilter('female')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${genderFilter === 'female' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🙋‍♀️ Nữ
            </button>
          </div>

          <input
            type="text"
            placeholder="Tìm theo tên trường đại học..."
            value={universitySearch}
            onChange={(e) => setUniversitySearch(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((cand) => (
            <div
              key={cand.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between gap-5 hover:border-blue-500/40 hover:bg-white/[0.08] transition-all duration-300 shadow-xl"
            >
              <div className="flex gap-4 items-start">
                
                {/* Avatar wrap */}
                <div className="relative shrink-0">
                  <img src={cand.avatar} alt={cand.name} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                  
                  {/* Glowing match percentage badge */}
                  <span className={`absolute -bottom-1 -right-1 text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-md ${
                    cand.matchPercentage >= 80 ? 'bg-emerald-500' :
                    cand.matchPercentage >= 60 ? 'bg-blue-500' :
                    'bg-slate-500'
                  }`}>
                    {cand.matchPercentage}% khớp
                  </span>
                </div>

                {/* Candidate basic info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-base">{cand.name}</span>
                    <span className="text-slate-500 text-xs">{cand.age} tuổi</span>
                  </div>
                  <p className="text-xs text-blue-300 font-semibold mt-0.5">🏫 {cand.university}</p>
                </div>
              </div>

              {/* Bio description */}
              <p className="text-xs text-slate-300 bg-black/25 p-3 rounded-xl italic leading-relaxed">
                "{cand.description}"
              </p>

              {/* Similarity parameters list */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Các điểm tương đồng lối sống</span>
                
                <div className="flex flex-wrap gap-1.5">
                  {cand.matchingKeys.map((key, i) => (
                    <span key={i} className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span>✓</span> {key}
                    </span>
                  ))}
                  
                  {/* Diff list items */}
                  {cand.matchingKeys.length < 6 && (
                    <span className="text-[9px] font-medium text-slate-500 italic">
                      +{6 - cand.matchingKeys.length} thói quen sinh hoạt khác biệt
                    </span>
                  )}
                </div>
              </div>

              {/* Chat action button */}
              <button
                onClick={() => handleStartChat(cand.id, cand.name)}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                💬 Nhắn tin kết nối
              </button>

            </div>
          ))}

          {filteredMatches.length === 0 && (
            <div className="col-span-2 text-center py-16 text-slate-500 flex flex-col items-center gap-2">
              <span className="text-4xl">📭</span>
              <p className="text-xs">Không tìm thấy ứng viên ghép bạn cùng phòng phù hợp với bộ lọc.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
