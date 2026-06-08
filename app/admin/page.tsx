'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, FileText, CheckCircle2, AlertCircle, Sparkles, Send, Calendar, List, Clock, CheckCircle, Trash2, Edit3, X, Check } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function AdminPortal() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [passagesList, setPassagesList] = useState<any[]>([]);
  const [loadingPassages, setLoadingPassages] = useState(false);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editingDateValue, setEditingDateValue] = useState<string>('');
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');

  const handleDeletePassage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this passage? This will also delete all associated questions and attempts.')) return;
    try {
      const res = await fetch(`/api/admin/passages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchPassages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateDate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/passages/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ published_date: editingDateValue })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update date');
      setEditingDateId(null);
      fetchPassages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchPassages = async () => {
    if (!sessionToken) return;
    setLoadingPassages(true);
    try {
      const res = await fetch('/api/admin/passages', {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setPassagesList(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch passages', err);
    } finally {
      setLoadingPassages(false);
    }
  };

  useEffect(() => {
    if (isAdmin && sessionToken) {
      fetchPassages();
    }
  }, [isAdmin, sessionToken]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setIsAdmin(true);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'lulujangid@gmail.com';
      if (session.user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        router.push('/dashboard');
        return;
      }
      setSessionToken(session.access_token);
      setIsAdmin(true);
    };
    checkAdmin();
  }, [router]);

  const [passage, setPassage] = useState({
    title: '',
    content: '',
    difficulty: 2,
    topic: 'economics',
    published_date: new Date().toISOString().split('T')[0]
  });

  const emptyQuestion = {
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: '',
    question_type: 'main_idea'
  };

  const [questions, setQuestions] = useState<any[]>(Array(5).fill({ ...emptyQuestion }));



  const updateQuestion = (index: number, field: string, value: string) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setQuestions(newQs);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {})
        },
        body: JSON.stringify({ passcode: 'dailycat2026', passage, questions })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to publish');

      setStatus({ type: 'success', message: '🔥 RC successfully published to all users!' });
      // Clear forms
      setPassage({ ...passage, title: '', content: '' });
      setQuestions(Array(5).fill({ ...emptyQuestion }));
      fetchPassages(); // Refresh the list
      setActiveView('list');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    setStatus({ type: null, message: '' });
    setTimeLeft(15);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) return 1;
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {})
        },
        body: JSON.stringify({ passcode: 'dailycat2026', customTopic: passage.topic, difficulty: passage.difficulty })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to generate using AI');

      const { passage: aiPassage, questions: aiQuestions } = data.data;

      setPassage({
        ...passage,
        title: aiPassage.title || '',
        content: aiPassage.content || '',
        difficulty: aiPassage.difficulty || 2,
        topic: aiPassage.topic || passage.topic
      });

      const newQuestions = Array(5).fill({ ...emptyQuestion }).map((empty, idx) => {
        if (aiQuestions[idx]) {
          return {
            ...empty,
            ...aiQuestions[idx],
            option_a: aiQuestions[idx].option_a.replace(/^[A-D]\.\s*/, ''),
            option_b: aiQuestions[idx].option_b.replace(/^[A-D]\.\s*/, ''),
            option_c: aiQuestions[idx].option_c.replace(/^[A-D]\.\s*/, ''),
            option_d: aiQuestions[idx].option_d.replace(/^[A-D]\.\s*/, ''),
          };
        }
        return empty;
      });

      setQuestions(newQuestions);
      setStatus({ type: 'success', message: '✨ AI Generation Complete! Please review before publishing.' });

    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      clearInterval(timer);
      setTimeLeft(null);
      setGeneratingAI(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FAFAF9] dark:bg-[#18181B] p-6 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#4F46E5] animate-spin" />
        <span className="font-mono text-xs text-gray-500">Verifying Admin Privileges...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FAFAF9] dark:bg-[#18181B] min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
              {activeView === 'list' ? 'Manage RC Passages' : 'Create RC Passage'}
            </h1>
            <p className="font-mono text-xs text-gray-500 mt-2">
              {activeView === 'list' ? 'Generate, schedule, or view previously saved RC passages.' : 'Publish an RC manually, or use the AI Autopilot.'}
            </p>
          </div>
          
          {activeView === 'list' ? (
            <button 
              onClick={() => setActiveView('form')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-[#1A1A18] text-white dark:bg-white dark:text-black shadow-md hover:shadow-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              Create New Passage
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('list')}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
              >
                Back to List
              </button>
              <button 
                onClick={handleGenerateAI}
                disabled={generatingAI}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all ${
                  generatingAI ? 'bg-indigo-100/50 text-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${generatingAI ? 'animate-pulse' : ''}`} />
                <span className="min-w-[120px] text-left">
                  {generatingAI 
                    ? (timeLeft !== null ? `Generating... (~${timeLeft}s)` : 'Generating...')
                    : 'Generate with AI'}
                </span>
              </button>
            </div>
          )}
        </div>

        {activeView === 'form' && (
          <>
            {status.type && (
              <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-semibold ${
                status.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {status.message}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Passage Settings */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1A1A18] p-6 rounded-xl border border-[#E5E5E3] dark:border-[#27272A]">
              <h2 className="font-mono font-bold text-xs text-gray-500 mb-4 border-b border-[#E5E5E3] dark:border-[#27272A] pb-2">PASSAGE METADATA</h2>
              
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Publish Date
                  <input type="date" value={passage.published_date} onChange={e => setPassage({...passage, published_date: e.target.value})} className="px-3 py-2 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-[#FAFAF9] dark:bg-[#18181B] font-mono text-xs" />
                </label>
                
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Topic
                  <select 
                    value={isCustomTopic ? 'custom' : passage.topic} 
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setIsCustomTopic(true);
                        setPassage({...passage, topic: ''});
                      } else {
                        setIsCustomTopic(false);
                        setPassage({...passage, topic: e.target.value});
                      }
                    }} 
                    className="px-3 py-2 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-[#FAFAF9] dark:bg-[#18181B] font-mono text-xs"
                  >
                    <option value="economics">Economics</option>
                    <option value="science">Science & Tech</option>
                    <option value="literature">Literature / Arts</option>
                    <option value="social">Sociology</option>
                    <option value="abstract">Philosophy / Abstract</option>
                    <option value="history">History</option>
                    <option value="psychology">Psychology</option>
                    <option value="politics">Politics & Governance</option>
                    <option value="business">Business & Management</option>
                    <option value="environment">Environment & Ecology</option>
                    <option value="custom">Custom...</option>
                  </select>
                  {isCustomTopic && (
                    <input 
                      type="text" 
                      placeholder="Type custom topic (e.g. AI Ethics)" 
                      value={passage.topic} 
                      onChange={e => setPassage({...passage, topic: e.target.value})} 
                      className="px-3 py-2 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-[#FAFAF9] dark:bg-[#18181B] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    />
                  )}
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Difficulty (1=Mod, 2=Hard, 3=V.Hard)
                  <input type="number" min="1" max="3" value={passage.difficulty} onChange={e => setPassage({...passage, difficulty: parseInt(e.target.value)})} className="px-3 py-2 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-[#FAFAF9] dark:bg-[#18181B] font-mono text-xs" />
                </label>
              </div>
            </div>
          </div>

          {/* Passage Content Editor */}
          <div className="lg:col-span-8 bg-white dark:bg-[#1A1A18] p-6 rounded-xl border border-[#E5E5E3] dark:border-[#27272A]">
            <h2 className="font-mono font-bold text-xs text-gray-500 mb-4 border-b border-[#E5E5E3] dark:border-[#27272A] pb-2">PASSAGE CONTENT</h2>
            
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Passage Title..."
                value={passage.title}
                onChange={e => setPassage({...passage, title: e.target.value})}
                className="text-xl font-serif font-bold px-4 py-3 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-[#FAFAF9] dark:bg-[#18181B] w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Paste the full passage text here..."
                value={passage.content}
                onChange={e => setPassage({...passage, content: e.target.value})}
                className="h-64 font-sans text-sm leading-relaxed px-4 py-3 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-[#FAFAF9] dark:bg-[#18181B] w-full resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

        </div>

        {/* Questions Editor */}
        <div className="bg-white dark:bg-[#1A1A18] p-6 rounded-xl border border-[#E5E5E3] dark:border-[#27272A]">
          <h2 className="font-mono font-bold text-xs text-gray-500 mb-6 border-b border-[#E5E5E3] dark:border-[#27272A] pb-2">5 COMPREHENSION QUESTIONS</h2>
          
          <div className="grid grid-cols-1 gap-8">
            {questions.map((q, i) => (
              <div key={i} className="flex flex-col gap-3 p-5 border border-[#E5E5E3] dark:border-[#27272A] rounded-lg bg-[#FAFAF9] dark:bg-[#18181B]">
                <div className="flex items-center gap-3">
                  <span className="bg-black text-white dark:bg-white dark:text-black w-6 h-6 flex items-center justify-center rounded text-xs font-mono font-bold">{i+1}</span>
                  <input
                    type="text"
                    placeholder="Question Text..."
                    value={q.question_text}
                    onChange={e => updateQuestion(i, 'question_text', e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-white dark:bg-black text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <select value={q.question_type} onChange={e => updateQuestion(i, 'question_type', e.target.value)} className="w-32 px-2 py-2 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-white dark:bg-black font-mono text-xs">
                    <option value="main_idea">Main Idea</option>
                    <option value="inference">Inference</option>
                    <option value="factual">Factual</option>
                    <option value="tone">Tone</option>
                    <option value="vocabulary">Vocabulary</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-9">
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500 uppercase w-4">{opt}</span>
                      <input
                        type="text"
                        placeholder={`Option ${opt.toUpperCase()}...`}
                        value={q[`option_${opt}`]}
                        onChange={e => updateQuestion(i, `option_${opt}`, e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-white dark:bg-black text-xs font-sans focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pl-9 mt-2">
                  <label className="flex items-center gap-2 text-xs font-bold font-mono text-[#4F46E5] dark:text-[#6366F1]">
                    CORRECT:
                    <select value={q.correct_option} onChange={e => updateQuestion(i, 'correct_option', e.target.value)} className="px-2 py-1 rounded border border-[#4F46E5] bg-[#4F46E5]/10 outline-none">
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </label>
                  
                  <input
                    type="text"
                    placeholder="Brief explanation for the correct answer..."
                    value={q.explanation}
                    onChange={e => updateQuestion(i, 'explanation', e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-[#4F46E5]/30 rounded bg-[#4F46E5]/5 text-xs font-sans focus:outline-none text-[#4F46E5] dark:text-[#6366F1]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 pb-12">
          <button
            onClick={handlePublish}
            disabled={publishing || !passage.title || !passage.content}
            className={`px-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center gap-2 ${
              publishing || !passage.title || !passage.content
                ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                : 'bg-[#1A1A18] hover:bg-black dark:bg-[#FAFAF9] dark:hover:bg-white text-white dark:text-black shadow-lg hover:shadow-xl'
            }`}
          >
            {publishing ? 'Saving...' : 'SAVE & SCHEDULE PASSAGE'}
            <Send className="w-4 h-4" />
          </button>
        </div>
        </>
        )}

        {/* Passages List */}
        {activeView === 'list' && (
        <div className="bg-white dark:bg-[#1A1A18] p-6 rounded-xl border border-[#E5E5E3] dark:border-[#27272A]">
          <div className="flex items-center justify-between mb-6 border-b border-[#E5E5E3] dark:border-[#27272A] pb-4">
            <h2 className="font-mono font-bold text-xs text-gray-500 flex items-center gap-2">
              <List className="w-4 h-4" />
              SCHEDULED & PREVIOUS PASSAGES
            </h2>
            <button onClick={fetchPassages} className="text-xs font-semibold text-indigo-500 hover:text-indigo-600">
              Refresh
            </button>
          </div>
          
          {loadingPassages ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#4F46E5] animate-spin" />
            </div>
          ) : passagesList.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500 font-medium">
              No passages found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-mono text-gray-500 uppercase bg-[#FAFAF9] dark:bg-[#18181B] border-b border-[#E5E5E3] dark:border-[#27272A]">
                  <tr>
                    <th className="px-4 py-3">Publish Date</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Topic</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passagesList.map((p) => {
                    const isPublished = new Date(p.published_date) <= new Date();
                    return (
                      <tr key={p.id} className="border-b border-[#E5E5E3] dark:border-[#27272A] hover:bg-[#FAFAF9] dark:hover:bg-[#18181B]/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium whitespace-nowrap">
                          {editingDateId === p.id ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="date" 
                                value={editingDateValue} 
                                onChange={e => setEditingDateValue(e.target.value)}
                                className="px-2 py-1 border border-[#E5E5E3] dark:border-[#27272A] rounded bg-white dark:bg-black text-xs outline-none"
                              />
                              <button onClick={() => handleUpdateDate(p.id)} className="text-green-500 hover:text-green-600 bg-green-50 dark:bg-green-900/20 p-1 rounded"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditingDateId(null)} className="text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 p-1 rounded"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingDateId(p.id); setEditingDateValue(p.published_date); }}>
                              {p.published_date}
                              <Edit3 className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1A1A18] dark:text-[#FAFAF9] max-w-xs truncate" title={p.title}>{p.title}</td>
                        <td className="px-4 py-3 capitalize">{p.topic}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.difficulty === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            p.difficulty === 2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {p.difficulty === 1 ? 'Moderate' : p.difficulty === 2 ? 'Hard' : 'V. Hard'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 font-semibold text-xs ${
                            isPublished ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {isPublished ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {isPublished ? 'Published' : 'Scheduled'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeletePassage(p.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete Passage">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}
