'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Clock, Users, ArrowRight, Share2, Sparkles, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { getMockStorage, mockDb } from '@/lib/supabase';
import { Passage, Question, Attempt } from '@/types';
import ScoreRing from '@/components/ScoreRing';
import QuestionCard from '@/components/QuestionCard';
import { formatTime } from '@/lib/utils';
import { toPng } from 'html-to-image';

export default function ResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [percentile, setPercentile] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { currentUser } = getMockStorage();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);

    const loadResults = async () => {
      try {
        const res = await mockDb.getTodayPassageWithAnswers();
        const userAttempt = await mockDb.getAttempt(currentUser.id, res.passage.id);
        
        if (!userAttempt) {
          // If not attempted yet, redirect back to solving page
          router.push('/rc/today');
          return;
        }

        setPassage(res.passage);
        setQuestions(res.questions);
        setAttempt(userAttempt);

        // Calculate today's percentile benchmark
        const pctl = await mockDb.getTodayPercentile(userAttempt.score);
        setPercentile(pctl);
      } catch (err) {
        console.error("Failed to load results", err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [router]);

  const handleDownloadCard = async () => {
    if (!shareCardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        backgroundColor: '#FAFAF9',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '500px',
          height: '500px',
        },
        width: 500,
        height: 500,
      });
      
      const link = document.createElement('a');
      link.download = `dailycatrc_score_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image', error);
      alert('Failed to generate score card image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !attempt || !passage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#4F46E5] animate-spin" />
        <span className="font-mono text-xs text-gray-500">Retrieving attempt analysis...</span>
      </div>
    );
  }

  const scorePercent = Math.round((attempt.score / attempt.total_questions) * 100);

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
      
      {/* Top Navigation Back to Dashboard */}
      <div className="flex items-center justify-between border-b border-[#E5E5E3] dark:border-[#2E2E2C] pb-4 select-none">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#1A1A18] dark:hover:text-[#FAFAF9] font-mono transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Dashboard</span>
        </Link>
        <span className="font-mono text-xs text-gray-400">
          Attempted at {new Date(attempt.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Hero Score Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Score Ring (SVG) */}
        <div className="md:col-span-4 border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-6 bg-white dark:bg-[#121211] flex flex-col items-center justify-center text-center gap-4">
          <h3 className="font-mono text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Your score
          </h3>
          <ScoreRing score={attempt.score} total={attempt.total_questions} size={150} strokeWidth={11} />
          <p className="font-serif text-xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
            {scorePercent >= 80 ? 'Exceptional Work!' : scorePercent >= 60 ? 'Good Effort!' : 'Keep Practicing'}
          </p>
        </div>

        {/* Right Card: Stats & Performance details */}
        <div className="md:col-span-8 border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-6 bg-white dark:bg-[#121211] flex flex-col justify-between gap-6">
          <div>
            <h3 className="font-mono text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] uppercase tracking-wider mb-2">
              Performance Indicators
            </h3>
            <h2 className="font-serif text-3xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
              {passage.title}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#E5E5E3] dark:border-[#2E2E2C] pt-6">
            {/* Time Taken */}
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                Time Elapsed
              </span>
              <span className="font-mono text-lg font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                {formatTime(attempt.time_taken_seconds)}
              </span>
            </div>

            {/* Avg Time Per Question */}
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                Avg Time / Question
              </span>
              <span className="font-mono text-lg font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                {formatTime(Math.round(attempt.time_taken_seconds / attempt.total_questions))}
              </span>
            </div>

            {/* Percentile benchmark */}
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                <Users className="w-3.5 h-3.5" />
                Today's Rank
              </span>
              <span className="font-mono text-lg font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                Top {100 - percentile}%
              </span>
            </div>

            {/* Status note */}
            <div className="col-span-2 sm:col-span-2 flex flex-col gap-1">
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                <Trophy className="w-3.5 h-3.5" />
                Percentile
              </span>
              <span className="font-sans text-xs text-green-600 dark:text-green-400 font-semibold">
                Better than {percentile}% of users today!
              </span>
            </div>
          </div>

          {/* Share & Leaderboard Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white font-mono font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Share Scorecard
            </button>
            <Link
              href="/leaderboard"
              className="px-4 py-2 border border-[#E5E5E3] dark:border-[#2E2E2C] hover:border-gray-400 dark:hover:border-gray-600 text-[#1A1A18] dark:text-[#FAFAF9] font-mono font-semibold text-xs rounded transition-colors flex items-center gap-1"
            >
              <span>View Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Explanations Header */}
      <div className="flex flex-col gap-2 mt-4 border-b border-[#E5E5E3] dark:border-[#2E2E2C] pb-3">
        <h3 className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
          Question Analysis & Explanations
        </h3>
        <p className="font-sans text-xs text-gray-400 dark:text-gray-500">
          Review correct answers and read option reasoning to improve your scores.
        </p>
      </div>

      {/* Explanations Single View */}
      <div className="flex flex-col gap-4">
        {questions.length > 0 && (
          <QuestionCard
            key={questions[currentQuestionIndex].id}
            question={questions[currentQuestionIndex]}
            questionIndex={currentQuestionIndex}
            selectedAnswer={attempt.answers[questions[currentQuestionIndex].id]}
            isCompleted={true}
            correctAnswer={questions[currentQuestionIndex].correct_option}
            explanation={questions[currentQuestionIndex].explanation}
          />
        )}

        {/* Navigation Block */}
        <div className="border-t border-[#E5E5E3] dark:border-[#2E2E2C] pt-3 pb-2 flex items-center justify-between shrink-0">
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className={`px-2 sm:px-3 py-1.5 text-xs font-mono font-semibold rounded border ${currentQuestionIndex === 0 ? 'border-transparent text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'border-[#E5E5E3] dark:border-[#2E2E2C] text-[#1A1A18] dark:text-[#FAFAF9] hover:bg-gray-50 dark:hover:bg-black/20 transition-colors'}`}
            >
              ←
            </button>
            
            <div className="flex gap-1 overflow-x-auto">
              {questions.map((q, idx) => {
                const isSelected = attempt.answers[q.id];
                const isCorrect = isSelected === q.correct_option;
                
                let buttonStyle = 'border border-[#E5E5E3] dark:border-[#2E2E2C] text-gray-400 hover:bg-gray-50 dark:hover:bg-black/20';
                if (idx === currentQuestionIndex) {
                  buttonStyle = 'bg-[#1A1A18] text-white dark:bg-[#FAFAF9] dark:text-black';
                } else if (isCorrect) {
                  buttonStyle = 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20';
                } else if (isSelected && !isCorrect) {
                  buttonStyle = 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`min-w-[1.75rem] h-7 rounded flex items-center justify-center text-xs font-mono font-semibold transition-colors ${buttonStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className={`px-2 sm:px-3 py-1.5 text-xs font-mono font-semibold rounded border ${currentQuestionIndex === questions.length - 1 ? 'border-transparent text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'border-[#E5E5E3] dark:border-[#2E2E2C] text-[#1A1A18] dark:text-[#FAFAF9] hover:bg-gray-50 dark:hover:bg-black/20 transition-colors'}`}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Share Image Generator Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A18]/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[530px] border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-6 bg-white dark:bg-[#121211] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 relative">
            
            <div className="flex justify-between items-center border-b border-[#E5E5E3] dark:border-[#2E2E2C] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1A1A18] dark:text-[#FAFAF9] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
                Shareable Card Preview
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 font-mono text-xs"
              >
                CLOSE
              </button>
            </div>

            {/* Render Card exactly in 500x500 square box for social platforms */}
            <div className="border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-md overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-black/20 p-2">
              <div 
                ref={shareCardRef}
                className="w-[500px] h-[500px] bg-[#FAFAF9] text-[#1A1A18] p-10 flex flex-col justify-between border border-[#E5E5E3]"
                style={{ fontFamily: 'sans-serif' }}
              >
                <div className="flex justify-between items-start border-b border-[#E5E5E3] pb-4">
                  <div>
                    <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1A18]">
                      dailycat<span className="text-[#4F46E5]">rc</span>
                    </span>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">dailycatrc.com</p>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-gray-500 uppercase tracking-widest bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                    DAILY PRACTICE
                  </span>
                </div>

                <div className="flex flex-col gap-6 text-center items-center my-auto">
                  <div className="relative w-36 h-36 flex items-center justify-center bg-white border border-[#E5E5E3] rounded-full">
                    {/* Simplified Score representation in center */}
                    <div className="absolute inset-2 border-4 border-dashed border-[#E5E5E3] rounded-full" />
                    <div className="flex flex-col items-center">
                      <span className="font-serif text-4xl font-bold text-[#1A1A18]">{attempt.score}/{attempt.total_questions}</span>
                      <span className="font-mono text-xs text-gray-500">{scorePercent}% Accuracy</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="font-serif text-xl font-bold text-[#1A1A18] px-2 truncate max-w-[420px]">
                      {passage.title}
                    </p>
                    <p className="text-xs text-green-700 font-semibold font-mono">
                      ⭐ Better than {percentile}% of users today!
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-[#E5E5E3] pt-4 text-[10px] text-gray-400 font-mono">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span>NAME: <span className="font-bold text-[#1A1A18]">{user.name}</span></span>
                    <span>STREAK: <span className="font-bold text-[#1A1A18]">{user.streak_count} Days 🔥</span></span>
                  </div>
                  <div className="text-right">
                    <span>DATE: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="flex-1 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-mono font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <span>Generating image...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-3 border border-[#E5E5E3] hover:bg-gray-50 text-[#1A1A18] font-mono font-semibold text-xs rounded transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
