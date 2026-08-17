'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toast } from '@/components/shared/Toast';
import { createStudentAchievementAction } from '@/app/actions/studentActions';
import type { StudentWithFlag } from '@/lib/supabase/getStudentsData';

interface Quest {
  id: string;
  title: string;
  points: number;
  status: 'available' | 'completed' | 'claimed';
  category: 'homework' | 'wellness' | 'accuracy';
  description: string;
}

interface QuestBoardProps {
  student?: StudentWithFlag;
  setActiveAvatar?: (avatar: string) => void;
  setActiveTitle?: (title: string) => void;
  activeAvatar?: string;
  activeTitle?: string;
}

export default function QuestBoard({ student, setActiveAvatar, setActiveTitle, activeAvatar, activeTitle }: QuestBoardProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const attendanceList = student?.attendance || [];
  const streak = attendanceList.reduce((count, record, index, records) => {
    if (index === 0 || records[index - 1].status === 'present' || records[index - 1].status === 'late') return count + 1;
    return count;
  }, 0);
  const gradesList = student?.grades || [];
  const [xp, setXp] = useState(() => gradesList.reduce((total, grade) => total + Math.round((grade.score / grade.maxScore) * 100), 0));
  const [coins, setCoins] = useState(0);
  const maxXp = 500;
  const level = 3;

  const homeworkList = student?.homework || [];
  const [quests, setQuests] = useState<Quest[]>(() => homeworkList.slice(0, 3).map((homework, index) => ({
    id: homework.id,
    title: homework.title,
    points: 50 + index * 25,
    status: homework.isSubmitted ? 'completed' : 'available',
    category: 'homework',
    description: `${homework.subject} assignment${homework.isSubmitted ? ' submitted successfully.' : ` due ${homework.dueDate}.`}`,
  })));

  // Shop state
  const [shopItems, setShopItems] = useState([
    { id: 's1', name: 'Astro-Scholar Avatar', cost: 100, emoji: '👩‍🚀', unlocked: false },
    { id: 's2', name: 'Math Extra Credit (+2 Marks)', cost: 200, emoji: '📈', unlocked: false },
    { id: 's3', name: 'Math Wizard Profile Title', cost: 50, emoji: '🧙‍♂️', unlocked: false },
    { id: 's4', name: 'Science Extra Credit (+2 Marks)', cost: 200, emoji: '🧪', unlocked: false },
  ]);



  const [activeTab, setActiveTab] = useState<'quests' | 'leaderboard'>('quests');
  
  // House points state
  const [housePoints, setHousePoints] = useState(() => (student?.grades || []).reduce((total, grade) => total + grade.score, 0));
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const studentName = student?.displayName || 'Aarav Sharma';
  const leaderboard = [{ name: `${studentName} (You)`, avatar: activeAvatar || '🎓', title: activeTitle || 'Level 3 Explorer', xp, streak, house: 'Agni (Red)', isMe: true }];

  // House Rankings
  const houseRankings = [
    { name: 'Agni House (Red)', points: housePoints, icon: '🔥', style: 'border-warm-clay/20 bg-warm-clay/[0.02] text-warm-clay' },
    { name: 'Vayu House (Yellow)', points: 1280, icon: '⚡', style: 'border-marigold/20 bg-marigold/[0.02] text-marigold' },
    { name: 'Prithvi House (Green)', points: 1120, icon: '🌿', style: 'border-sage/20 bg-sage/[0.02] text-sage' },
    { name: 'Jal House (Blue)', points: 980, icon: '💧', style: 'border-indigo-500/20 bg-indigo-500/[0.02] text-indigo-500' },
  ];

  const handleClaimPoints = async (questId: string, points: number) => {
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: 'claimed' } : q));
    setCoins(prev => prev + points); // Earn coins!
    setHousePoints(prev => prev + points); // Add directly to Agni House points!
    
    // Add XP and level up if needed
    setXp(prev => {
      const nextXp = prev + points;
      if (nextXp >= maxXp) {
        setToastMessage('🎉 Level Up! You reached Level ' + (level + 1) + '!');
        return nextXp - maxXp;
      }
      return nextXp;
    });

    const quest = quests.find(q => q.id === questId);
    if (quest) {
      await createStudentAchievementAction(
        student.studentId,
        `Completed Quest: ${quest.title}`,
        `${student.displayName} completed the "${quest.title}" quest and earned ${quest.points} Shiksha coins.`,
        quest.category === 'homework' ? 'homework' : 'academic'
      );
    }
  };

  const handleBuyItem = async (itemId: string, cost: number) => {
    if (coins < cost) {
      setToastMessage('❌ Not enough Shiksha Coins! Complete more quests to earn coins.');
      return;
    }
    setCoins(prev => prev - cost);
    setShopItems(prev => prev.map(item => item.id === itemId ? { ...item, unlocked: true } : item));
    
    let itemName = '';
    // Equip the item instantly!
    if (itemId === 's1') {
      setActiveAvatar('👩‍🚀');
      setToastMessage('🎉 Success! You unlocked and equipped the Astro-Scholar Avatar!');
      itemName = 'Astro-Scholar Avatar';
    } else if (itemId === 's2') {
      setToastMessage('🎉 Success! Redeemed +2 Extra Credit Marks in Math. The request has been sent to Ms. Ananya Mehra for approval!');
      itemName = 'Math Extra Credit (+2 Marks)';
    } else if (itemId === 's3') {
      setActiveTitle('Math Wizard');
      setToastMessage('🎉 Success! You unlocked and equipped the Math Wizard Title!');
      itemName = 'Math Wizard Profile Title';
    } else if (itemId === 's4') {
      setToastMessage('🎉 Success! Redeemed +2 Extra Credit Marks in Science. The request has been sent to Ms. Ananya Mehra for approval!');
      itemName = 'Science Extra Credit (+2 Marks)';
    }

    if (itemName) {
      await createStudentAchievementAction(
        student.studentId,
        `Unlocked Shop Reward: ${itemName}`,
        `${student.displayName} redeemed coins in the reward store to unlock "${itemName}".`,
        'academic'
      );
    }
  };

  return (
    <div className="student-quest-board rounded-[2rem] border border-white/80 bg-white/78 p-5 shadow-[0_20px_55px_rgba(63,81,181,.10)] backdrop-blur-xl space-y-6 sm:p-8">
      {/* Header / Stats Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-deep-teal/[0.02] border border-deep-teal/5 p-4 rounded-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="text-[10px] font-bold text-deep-teal/40 uppercase tracking-wider">Streak</div>
              <div className="font-display text-sm font-extrabold text-deep-teal">{streak} Days</div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-deep-teal/15 pl-6">
            <span className="text-3xl">🪙</span>
            <div>
              <div className="text-[10px] font-bold text-deep-teal/40 uppercase tracking-wider">Shiksha Coins</div>
              <div className="font-display text-sm font-extrabold text-deep-teal">{coins}</div>
            </div>
          </div>
        </div>

        {/* Campus coins and assignments are the student reward loop. */}
        <div className="hidden flex items-center gap-3 bg-warm-clay/5 border border-warm-clay/10 px-4 py-2 rounded-xl">
          <span className="text-2xl">🚩</span>
          <div>
            <div className="text-[9px] font-bold text-warm-clay/60 uppercase tracking-wider">Agni House (Red)</div>
            <div className="font-display text-sm font-extrabold text-warm-clay">{housePoints} Points</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-deep-teal/10 gap-6">
        <button
          onClick={() => setActiveTab('quests')}
          className={`pb-2.5 text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${
            activeTab === 'quests'
              ? 'border-deep-teal text-deep-teal'
              : 'border-transparent text-deep-teal/40 hover:text-deep-teal/70'
          }`}
        >
          Active Quests
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`hidden pb-2.5 text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${
            activeTab === 'leaderboard'
              ? 'border-deep-teal text-deep-teal'
              : 'border-transparent text-deep-teal/40 hover:text-deep-teal/70'
          }`}
        >
          School Standings
        </button>
      </div>

      {activeTab === 'quests' && (
        <>
          {/* Quests Section */}
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-deep-teal">My Quest Board</h2>
              <p className="font-body text-xs text-deep-teal/50">Complete learning paths and earn points for consistency.</p>
            </div>

            <div className="space-y-3">
              {quests.map((quest) => (
                <div 
                  key={quest.id} 
                  className={`border rounded-xl p-4 transition-all duration-300 ${
                    quest.status === 'claimed'
                      ? 'border-deep-teal/5 bg-deep-teal/[0.01] opacity-60'
                      : 'border-deep-teal/10 bg-white hover:border-deep-teal/20'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {quest.category === 'homework' ? '📚' : quest.category === 'wellness' ? '🧘' : '🎯'}
                        </span>
                        <h3 className="font-display text-xs font-extrabold text-deep-teal">{quest.title}</h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-deep-teal/5 text-deep-teal rounded-full">
                          +{quest.points} XP
                        </span>
                      </div>
                      <p className="font-body text-xs text-deep-teal/65 leading-relaxed">
                        {quest.description}
                      </p>
                    </div>

                    {quest.status === 'available' && (
                      <span className="text-[10px] font-bold text-marigold bg-marigold/10 border border-marigold/20 px-3 py-1 rounded-full uppercase tracking-wider">
                        In Progress
                      </span>
                    )}

                    {quest.status === 'completed' && (
                      <button
                        onClick={() => handleClaimPoints(quest.id, quest.points)}
                        className="text-[10px] font-bold text-white bg-sage hover:bg-sage/90 px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md transition-all active:scale-95 animate-pulse"
                      >
                        Claim XP
                      </button>
                    )}

                    {quest.status === 'claimed' && (
                      <span className="text-[10px] font-bold text-deep-teal/40 bg-deep-teal/5 px-3 py-1 rounded-full uppercase tracking-wider">
                        Claimed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges / Rewards Section */}
          <div className="space-y-3 pt-2">
            <h3 className="font-display text-xs font-bold text-deep-teal/50 uppercase tracking-wider">My Unlocked Badges</h3>
            <div className="flex gap-3">
              <div className="flex flex-col items-center justify-center p-2.5 bg-sage/5 border border-sage/10 rounded-xl w-20 text-center space-y-1">
                <span className="text-xl">🏆</span>
                <span className="text-[8px] font-bold text-sage uppercase tracking-wider leading-tight">Consistent</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 bg-marigold/5 border border-marigold/10 rounded-xl w-20 text-center space-y-1">
                <span className="text-xl">🚀</span>
                <span className="text-[8px] font-bold text-marigold uppercase tracking-wider leading-tight">Streak King</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 bg-deep-teal/5 border border-deep-teal/10 rounded-xl w-20 text-center space-y-1 opacity-45">
                <span className="text-xl">🎓</span>
                <span className="text-[8px] font-bold text-deep-teal/60 uppercase tracking-wider leading-tight">A+ Submissions</span>
              </div>
            </div>
          </div>

          {/* Rewards Shop Section */}
          <div className="space-y-4 pt-4 border-t border-deep-teal/5">
            <div>
              <h3 className="font-display text-base font-bold text-deep-teal">Shiksha Reward Shop</h3>
              <p className="font-body text-xs text-deep-teal/50">Redeem your earned coins to unlock cool customization rewards!</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {shopItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`border border-deep-teal/10 rounded-xl p-4 text-center flex flex-col justify-between items-center space-y-3 ${
                    item.unlocked ? 'bg-sage/5 border-sage/20' : 'bg-white'
                  }`}
                >
                  <div className="text-3xl bg-deep-teal/[0.03] w-12 h-12 flex items-center justify-center rounded-full">
                    {item.emoji}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-extrabold text-deep-teal leading-snug">{item.name}</div>
                    <div className="text-[10px] font-bold text-deep-teal/40">Cost: {item.cost} Coins</div>
                  </div>

                  {item.unlocked ? (
                    <span className="w-full text-center py-1.5 bg-sage/10 text-sage border border-sage/20 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                      Unlocked!
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyItem(item.id, item.cost)}
                      className="w-full py-1.5 bg-deep-teal hover:bg-deep-teal/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-95 cursor-pointer hover:shadow-md"
                    >
                      Buy Item
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Inter-House Standings */}
          <div className="space-y-3">
            <div>
              <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-deep-teal/50">🏆 Inter-House Championship</h2>
              <p className="font-body text-xs text-deep-teal/40">Your points add directly to your House score!</p>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-4">
              {houseRankings.map((house, idx) => (
                <div 
                  key={house.name} 
                  className={`border rounded-2xl p-4 text-center space-y-1 ${house.style}`}
                >
                  <div className="text-2xl">{house.icon}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-85 leading-tight">{house.name}</div>
                  <div className="text-base font-extrabold">{house.points} pts</div>
                  <div className="text-[8px] font-bold opacity-60">Rank #{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Rankings */}
          <div className="space-y-3 pt-2">
            <div>
              <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-deep-teal/50">👤 Student Leaderboard</h2>
              <p className="font-body text-xs text-deep-teal/40">Streaks and points of your peers in Class 8A.</p>
            </div>

            <div className="border border-deep-teal/10 rounded-2xl overflow-hidden shadow-xs divide-y divide-deep-teal/10 bg-white">
              {leaderboard.map((student, idx) => (
                <div 
                  key={student.name}
                  className={`p-4 flex items-center justify-between transition-all duration-300 ${
                    student.isMe ? 'bg-deep-teal/[0.02] border-y border-deep-teal/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Circle */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      idx === 0 
                        ? 'bg-marigold text-white shadow-xs' 
                        : idx === 1 
                          ? 'bg-slate-300 text-deep-teal' 
                          : idx === 2 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-deep-teal/5 text-deep-teal/60'
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Avatar Icon */}
                    <div className="text-2xl bg-deep-teal/5 w-10 h-10 flex items-center justify-center rounded-xl border border-deep-teal/5">
                      {student.avatar}
                    </div>

                    {/* Name and Title */}
                    <div>
                      <div className={`text-xs font-extrabold text-deep-teal ${student.isMe ? 'text-deep-teal' : ''}`}>
                        {student.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] font-bold text-sage bg-sage/5 border border-sage/10 px-1.5 py-0.2 rounded uppercase tracking-wider">
                          {student.title}
                        </span>
                        <span className="text-[8px] font-bold text-deep-teal/50 border border-deep-teal/10 px-1.5 py-0.2 rounded uppercase tracking-wider">
                          {student.house}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats (Streak & XP) */}
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-[9px] font-bold text-deep-teal/40 uppercase tracking-wider">Streak</div>
                      <div className="text-xs font-extrabold text-deep-teal flex items-center justify-end gap-1">
                        🔥 {student.streak} Days
                      </div>
                    </div>
                    <div className="border-l border-deep-teal/10 pl-6 w-16">
                      <div className="text-[9px] font-bold text-deep-teal/40 uppercase tracking-wider">Points</div>
                      <div className="text-xs font-extrabold text-deep-teal">{student.xp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
