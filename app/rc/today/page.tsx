'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { getMockStorage, mockDb } from '../../../lib/supabase';
import { Passage, Question } from '../../../types';
import PassagePanel from '../../../components/PassagePanel';
import QuestionCard from '../../../components/QuestionCard';
import TimerDisplay from '../../../components/TimerDisplay';

export default function RCPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeTaken, setTimeTaken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const { currentUser } = getMockStorage();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);

    const loadPassage = async () => {
      try {
        const res = await mockDb.getTodayPassage();
        
        // If already attempted today, redirect to results page
        const attempt = await mockDb.getAttempt(currentUser.id, res.passage.id);
        if (attempt) {
          router.push('/rc/today/results');
          return;
        }

        setPassage(res.passage);
        setQuestions(res.questions);
      } catch (err) {
        console.error("Failed to load passage", err);
      } finally {
        setLoading(false);
      }
    };

    loadPassage();
  }, [router]);

  const handleSelectAnswer = (qId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => {
      if (prev[qId] === option) {
        const next = { ...prev };
        delete next[qId];
        return next;
      }
      return {
        ...prev,
        [qId]: option,
      };
    });
  };

  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  
  const currentIndexRef = React.useRef(currentQuestionIndex);
  React.useEffect(() => { currentIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);

  const questionsRef = React.useRef(questions);
  React.useEffect(() => { questionsRef.current = questions; }, [questions]);

  const handleTimerTick = React.useCallback((secs: number) => {
    setTimeTaken(secs);
    setQuestionTimes(prev => {
      const currentQ = questionsRef.current[currentIndexRef.current];
      if (!currentQ) return prev;
      return {
        ...prev,
        [currentQ.id]: (prev[currentQ.id] || 0) + 1
      };
    });
  }, []);

  const canSubmit = timeTaken >= 30; // 30 seconds minimum

  const handleSubmitClick = () => {
    if (!canSubmit) return;
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    if (!user || !passage) return;
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      // API trigger or fallback to mock DB write
      await mockDb.submitAttempt(user.id, passage.id, answers, timeTaken, questionTimes);
      router.push('/rc/today/results');
    } catch (err) {
      console.error("Submission failed", err);
      alert("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#E5E5E3] dark:border-[#2E2E2C] border-t-[#4F46E5] dark:border-t-[#6366F1] animate-spin" />
        <span className="font-mono text-xs text-gray-500 animate-pulse-glow">Preparing today's CAT RC passage...</span>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-rose-500 mb-4" />
        <h2 className="font-serif text-2xl font-bold mb-1">No Passage Available</h2>
        <p className="font-sans text-xs text-gray-500 mb-4">
          Today's passage hasn't been published yet. Please check back later.
        </p>
        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-[#E5E5E3] hover:bg-gray-300 rounded text-xs font-mono">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
      


      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 gap-6 items-stretch">
        
        {/* Left Column: Passage Panel */}
        <div className="lg:col-span-6 flex flex-col h-full lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto pr-2 border-r border-transparent lg:border-[#E5E5E3] lg:dark:border-[#2E2E2C] animate-fade-in">
          <PassagePanel passage={passage} />
        </div>

        {/* Right Column: Questions Panel */}
        <div className="lg:col-span-6 flex flex-col h-full lg:max-h-[calc(100vh-14rem)] lg:pl-2 animate-slide-in-right">
          
          <div className="flex items-center justify-between border-b border-[#E5E5E3] dark:border-[#2E2E2C] pb-3 mb-4 text-xs font-mono font-semibold text-gray-500 shrink-0 min-h-[44px]">
            <span className="uppercase tracking-wider">{Object.keys(answers).length} of {questions.length} answered</span>
            <TimerDisplay active={!submitting} onTick={handleTimerTick} />
          </div>

          {/* Scrollable Question Area */}
          <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-2 pb-2">
            {questions.length > 0 && (
              <QuestionCard
                key={questions[currentQuestionIndex].id}
                question={questions[currentQuestionIndex]}
                questionIndex={currentQuestionIndex}
                selectedAnswer={answers[questions[currentQuestionIndex].id]}
                onSelect={(opt) => handleSelectAnswer(questions[currentQuestionIndex].id, opt)}
              />
            )}
          </div>

          {/* Navigation and Submit Action Block (Anchored at Bottom) */}
          <div className="border-t border-[#E5E5E3] dark:border-[#2E2E2C] pt-3 pb-2 flex items-center justify-between shrink-0 mt-2">
            
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
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`min-w-[1.75rem] h-7 rounded flex items-center justify-center text-xs font-mono font-semibold transition-colors ${
                      idx === currentQuestionIndex && answers[q.id]
                        ? 'bg-green-600 text-white dark:bg-green-500 ring-2 ring-offset-1 ring-green-600/30 dark:ring-green-500/30'
                        : idx === currentQuestionIndex
                        ? 'bg-[#1A1A18] text-white dark:bg-[#FAFAF9] dark:text-black'
                        : answers[q.id]
                        ? 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600/90 dark:hover:bg-green-500'
                        : 'border border-[#E5E5E3] dark:border-[#2E2E2C] text-gray-400 hover:bg-gray-50 dark:hover:bg-black/20'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className={`px-2 sm:px-3 py-1.5 text-xs font-mono font-semibold rounded border ${currentQuestionIndex === questions.length - 1 ? 'border-transparent text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'border-[#E5E5E3] dark:border-[#2E2E2C] text-[#1A1A18] dark:text-[#FAFAF9] hover:bg-gray-50 dark:hover:bg-black/20 transition-colors'}`}
              >
                →
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitClick}
              disabled={!canSubmit || submitting}
              className={`px-4 sm:px-5 py-2 rounded font-mono font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                canSubmit && !submitting
                  ? 'bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-black/20 text-gray-400 cursor-not-allowed border border-transparent'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A18]/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-6 bg-white dark:bg-[#121211] flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col gap-1.5 text-center">
              <h3 className="font-serif text-2xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
                Submit Your Attempt?
              </h3>
              <p className="font-sans text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                You have answered {Object.keys(answers).length} out of {questions.length} questions. You cannot change your answers after submission. Unanswered questions will receive a score of 0.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1 font-mono text-xs">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2.5 border border-[#E5E5E3] dark:border-[#2E2E2C] hover:bg-gray-50 dark:hover:bg-black/15 text-[#1A1A18] dark:text-[#FAFAF9] font-semibold rounded transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={confirmSubmit}
                className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] text-white font-semibold rounded transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
