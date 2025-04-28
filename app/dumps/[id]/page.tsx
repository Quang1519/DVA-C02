"use client"

import { ArrowRight, X, Search, ChevronDown, Send, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import QuizCard from "@/components/quiz-card"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useParams } from 'next/navigation'
import questionsData from '../../../data/questions_dump.json'
import Image from "next/image"
import QuestionPopup from "@/components/question-popup"

// Update the interfaces to properly handle multiple answers
interface Option {
  id: number
  text: string
  image: string
}

interface QuestionsDump {
  id: number
  question: string
  options: Option[]
  image: string
  correctAnswer: {
    id: number[] // Always treat as array for consistency
  }
  explaination: string
  reference: string
}

interface NavigationButtonProps {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled: boolean
}

// Extracted Navigation Button Component
const NavigationButton = ({ direction, onClick, disabled }: NavigationButtonProps) => (
  <Button
    variant="outline"
    onClick={onClick}
    disabled={disabled}
    className="nav-button"
  >
    {direction === 'prev' ? '←' : '→'}
  </Button>
)

// Add this interface and state to QuestionPage component
interface Interaction {
  input: string;
  response: string;
  citations: string[];
}

export default function QuestionPage() {
  const router = useRouter()
  const params = useParams()
  
  const questionId = useMemo(() => 
    params.id ? parseInt(params.id as string) : 1
  , [params.id])
  
  const currentQuestionIndex = questionId - 1

  const [questions] = useState<QuestionsDump[]>(questionsData.questions)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [questionInteractions, setQuestionInteractions] = useState<Record<number, Interaction[]>>({})

  const currentQuestion = useMemo(() => 
    questions[currentQuestionIndex]
  , [questions, currentQuestionIndex])

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      router.push(`/dumps/${currentQuestionIndex + 2}`)
      setSelectedAnswers([])
      setShowAnswer(false)
    }
  }, [currentQuestionIndex, questions.length, router])

  const handleOptionClick = useCallback((optionId: number) => {
    if (showAnswer) return

    setSelectedAnswers(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }, [showAnswer])

  const getOptionBackground = useCallback((optionId: number) => {
    const correctAnswers = currentQuestion.correctAnswer.id
    const isCorrect = correctAnswers.includes(optionId)
    const isSelected = selectedAnswers.includes(optionId)

    if (isSelected) {
      // Show selection in blue until answer is checked
      return showAnswer 
        ? (isCorrect ? "bg-green-200" : "bg-red-200")
        : "bg-blue-100"
    }

    if (showAnswer && isCorrect) {
      // Show correct answers when checked
      return "bg-green-200"
    }
    
    return undefined
  }, [currentQuestion, selectedAnswers, showAnswer])

  const isAnswerCorrect = useCallback(() => {
    const correctAnswers = currentQuestion.correctAnswer.id
    return (
      selectedAnswers.length === correctAnswers.length &&
      selectedAnswers.every(id => correctAnswers.includes(id))
    )
  }, [currentQuestion, selectedAnswers])

  useEffect(() => {
    setSelectedAnswers([])
    setShowAnswer(false)
  }, [questionId])

  // Load saved interactions when question changes
  useEffect(() => {
    const savedInteractions = localStorage.getItem(`question_${currentQuestion.id}_interactions`);
    if (savedInteractions) {
      setQuestionInteractions(prev => ({
        ...prev,
        [currentQuestion.id]: JSON.parse(savedInteractions)
      }));
    }
  }, [currentQuestion.id]);

  if (!currentQuestion) {
    return <div>Loading...</div>
  }

  const isMultipleAnswer = currentQuestion.correctAnswer.id.length > 1

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-2 sm:p-4">
      <Card className="w-full max-w-3xl p-3 sm:p-6 shadow-md relative">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <h1 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h1>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <NavigationButton
                direction="prev"
                onClick={() => router.push(`/${currentQuestionIndex}`)}
                disabled={currentQuestionIndex === 0}
              />
              <NavigationButton
                direction="next"
                onClick={() => router.push(`/dumps/${currentQuestionIndex + 2}`)}
                disabled={currentQuestionIndex === questions.length - 1}
              />
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-2 sm:mt-0 w-12 h-12 rounded-full shadow-sm border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700 flex items-center justify-center"
            onClick={() => setShowPopup(true)}
          >
            Ask
          </Button>
        </div>

        <div className="mb-4 sm:mb-6">
          <h2 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">Question:</h2>
          <p className="text-gray-800 text-sm sm:text-base">{currentQuestion.question}</p>
          {currentQuestion.image && (
            <div className="relative mt-4 w-full h-[300px]">
              <Image 
                src={`/${currentQuestion.image}`}
                alt="Question"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {currentQuestion.options.map((option) => (
            <div 
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className="cursor-pointer"
            >
              <QuizCard 
                label={option.text}
                selected={selectedAnswers.includes(option.id)}
                bgColor={getOptionBackground(option.id)}
                image={option.image}
              />
            </div>
          ))}
        </div>

        {showAnswer && (
          <div className="mb-6 sm:mb-8">
            <h2 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">
              {isAnswerCorrect() ? "Correct!" : "Incorrect!"}
            </h2>
            {!isAnswerCorrect() && (
              <div className="text-gray-800 mb-4">
                <p className="mb-2 text-sm sm:text-base">Correct answers:</p>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-sm sm:text-base">
                  {currentQuestion.correctAnswer.id.map(id => (
                    <li key={id}>
                      {currentQuestion.options.find(opt => opt.id === id)?.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Explanation Section */}
            {currentQuestion.explaination && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-700 mb-2 text-base">Explanation:</h3>
                <p className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap">
                  {currentQuestion.explaination}
                </p>
              </div>
            )}
            
            {/* Reference Section */}
            {currentQuestion.reference && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2 text-base">Reference:</h3>
                <p className="text-gray-800 text-sm sm:text-base">
                  {currentQuestion.reference}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
          <Button 
            variant="default" 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
            onClick={() => setShowAnswer(true)}
            disabled={selectedAnswers.length === 0 || showAnswer}
          >
            Check Answer
          </Button>
          <Button 
            variant="default" 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-1 text-sm sm:text-base"
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1 || !showAnswer}
          >
            Next <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {showPopup && (
          <QuestionPopup
            question={currentQuestion}
            onClose={() => setShowPopup(false)}
            interactions={questionInteractions[currentQuestion.id] || []}
            onInteractionUpdate={(newInteractions) => {
              // Update both state and localStorage
              setQuestionInteractions(prev => ({
                ...prev,
                [currentQuestion.id]: newInteractions
              }));
              localStorage.setItem(
                `question_${currentQuestion.id}_interactions`,
                JSON.stringify(newInteractions)
              );
            }}
          />
        )}
      </Card>
    </div>
  )
} 