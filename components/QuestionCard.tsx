'use client';

import React from 'react';
import { Question } from '../types';
import { cn } from '../lib/utils';
import { Check, X, HelpCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  selectedAnswer?: 'A' | 'B' | 'C' | 'D';
  onSelect?: (option: 'A' | 'B' | 'C' | 'D') => void;
  isCompleted?: boolean;
  correctAnswer?: string;
  explanation?: string;
}

export default function QuestionCard({
  question,
  questionIndex,
  selectedAnswer,
  onSelect,
  isCompleted = false,
  correctAnswer,
  explanation,
}: QuestionCardProps) {
  const options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[] = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ];

  const handleOptionClick = (key: 'A' | 'B' | 'C' | 'D') => {
    if (isCompleted || !onSelect) return;
    onSelect(key);
  };

  return (
    <div className="border border-[#E5E5E3] dark:border-[#2E2E2C] rounded-lg p-5 bg-[#FAFAF9] dark:bg-[#121211] flex flex-col gap-4 select-none">
      {/* Question Header */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#E5E5E3] dark:bg-[#2E2E2C] text-xs font-mono font-bold text-[#1A1A18] dark:text-[#FAFAF9]">
          {questionIndex + 1}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono tracking-wider text-[#4F46E5] dark:text-[#6366F1] uppercase">
            {question.question_type.replace('_', ' ')} Question
          </span>
          <h3 className="font-sans text-[15px] font-semibold text-[#1A1A18] dark:text-[#FAFAF9] leading-snug">
            {question.question_text}
          </h3>
        </div>
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.key;
          const isCorrect = correctAnswer === opt.key;
          
          let cardStyle = "border-[#E5E5E3] dark:border-[#2E2E2C] hover:border-gray-400 dark:hover:border-gray-600 bg-white dark:bg-black/20 text-[#1A1A18] dark:text-gray-300";
          let badgeStyle = "bg-[#FAFAF9] dark:bg-[#121211] border-[#E5E5E3] dark:border-[#2E2E2C] text-gray-500";

          if (isCompleted) {
            if (isCorrect) {
              cardStyle = "border-green-500 bg-green-50/50 dark:bg-green-950/20 text-green-900 dark:text-green-300";
              badgeStyle = "bg-green-500 text-white border-green-500";
            } else if (isSelected && !isCorrect) {
              cardStyle = "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300";
              badgeStyle = "bg-rose-500 text-white border-rose-500";
            } else {
              cardStyle = "border-[#E5E5E3] dark:border-[#2E2E2C] opacity-60 text-gray-400 dark:text-gray-600";
            }
          } else if (isSelected) {
            cardStyle = "border-[#4F46E5] dark:border-[#6366F1] bg-[#4F46E5]/5 dark:bg-[#6366F1]/5 text-[#4F46E5] dark:text-[#6366F1]";
            badgeStyle = "bg-[#4F46E5] text-white border-[#4F46E5] dark:bg-[#6366F1] dark:border-[#6366F1]";
          }

          return (
            <button
              key={opt.key}
              onClick={() => handleOptionClick(opt.key)}
              disabled={isCompleted}
              className={cn(
                "w-full text-left p-3.5 border rounded-md transition-all duration-150 flex items-start gap-3 font-sans text-sm outline-none focus:ring-1 focus:ring-[#4F46E5] dark:focus:ring-[#6366F1]",
                cardStyle
              )}
            >
              <span className={cn(
                "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded border text-xs font-mono font-semibold",
                badgeStyle
              )}>
                {opt.key}
              </span>
              <span className="leading-relaxed pt-0.5">{opt.text.replace(/^[A-D]\.\s*/, '')}</span>
              {isCompleted && isCorrect && <Check className="w-4 h-4 ml-auto text-green-600 flex-shrink-0 mt-1" />}
              {isCompleted && isSelected && !isCorrect && <X className="w-4 h-4 ml-auto text-rose-600 flex-shrink-0 mt-1" />}
            </button>
          );
        })}
      </div>

      {/* Explanation section for Completed Mode */}
      {isCompleted && explanation && (
        <div className="mt-2 p-4 border border-[#4F46E5]/15 dark:border-[#6366F1]/15 rounded bg-[#4F46E5]/5 dark:bg-[#6366F1]/5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4F46E5] dark:text-[#6366F1] font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>EXPLANATION</span>
          </div>
          <p className="font-sans text-xs leading-relaxed text-[#1A1A18] dark:text-gray-300">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
