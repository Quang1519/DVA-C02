"use client"

import { X, Search, ChevronDown, ArrowUp, CheckCircle2, Send, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { Card } from "./ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { callPerplexityApi } from '@/lib/api-service'

interface Question {
  id: number
  question: string
  options: {
    id: number
    text: string
    image: string
  }[]
  image: string
  correctAnswer: {
    id: number[]
  }
}

interface PopupProps {
  question: Question
  onClose: () => void
  interactions: Interaction[]
  onInteractionUpdate: (interactions: Interaction[]) => void
}

interface Interaction {
  input: string;
  response: string;
  citations: string[];
}

const formatQuestionAndOptions = (question: Question) => {
  const optionsText = question.options
    .map((option) => `• ${option.text}`)
    .join('\n');
  return `${question.question}\n\n${optionsText}`;
};

const getStorageKey = (questionId: number) => `question_${questionId}_interactions`;

export default function QuestionPopup({ 
  question, 
  onClose, 
  interactions,
  onInteractionUpdate 
}: PopupProps) {
  const [inputValue, setInputValue] = useState("")
  const [selectedModel, setSelectedModel] = useState("sonar")
  const [isLoading, setIsLoading] = useState(false)
  
  // Add ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Add scroll to bottom effect when interactions change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [interactions]); // This will trigger when interactions array changes

  // Keep the existing initial scroll effect
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []); // For initial mount

  useEffect(() => {
    if (interactions.length === 0) {
      setInputValue(formatQuestionAndOptions(question));
    }
  }, [question, interactions.length]);

  const handleApiCall = async () => {
    if (!inputValue.trim() || isLoading) return;

    const currentInput = inputValue;
    setIsLoading(true);
    
    // Immediately add input to interactions with empty response
    const tempInteractions = [...interactions, {
      input: currentInput,
      response: "Loading...",
      citations: []
    }];
    onInteractionUpdate(tempInteractions);
    setInputValue("");

    try {
      const { content, citations } = await callPerplexityApi(currentInput, selectedModel);
      
      // Update the last interaction with the actual response
      const newInteractions = [...interactions, {
        input: currentInput,
        response: content,
        citations: citations
      }];
      
      onInteractionUpdate(newInteractions);
    } catch (error) {
      console.error('Error calling API:', error)
      // Update the last interaction with error message
      const errorInteractions = [...interactions, {
        input: currentInput,
        response: "Error: Failed to get response from API",
        citations: []
      }];
      onInteractionUpdate(errorInteractions);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClear = () => {
    // Clear localStorage for current question
    localStorage.removeItem(getStorageKey(question.id));
    // Clear interactions through the callback
    onInteractionUpdate([]);
    // Reset input to initial question if needed
    setInputValue(formatQuestionAndOptions(question));
  };

  const formatResponseWithClickableCitations = (content: string, citations: string[]) => {
    // First handle headers with ##
    let formattedContent = content.replace(/##\s*(.*?)(?:\n|$)/g, '<h3 class="font-bold underline text-lg my-2">$1</h3>');
    
    // Then handle bold text with **
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Then handle citations
    formattedContent = formattedContent.replace(/\[(\d+)\]/g, (match, citationIndex) => {
      const index = parseInt(citationIndex) - 1;
      if (index >= 0 && index < citations.length) {
        return `<a href="${citations[index]}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">[${citationIndex}]</a>`;
      }
      return match;
    });

    return formattedContent;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-[80vh] flex flex-col relative">
        {/* Fixed Header */}
        <div className="p-2 border-b">
          <div className="flex items-center pr-8">
            <h2 className="font-semibold text-xl mr-3">Question</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 bg-slate-100 px-3 py-1 hover:bg-slate-200"
            >
              Clear History
            </Button>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content - Add ref here */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 pt-2"
        >
          {interactions.map((interaction, index) => (
            <div key={index} className="mb-8">
              {/* Input Data */}
              <div className="border rounded-lg bg-slate-50 p-4 mb-4">
                <h3 className="font-semibold text-lg mb-2">Input Data:</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{interaction.input}</p>
              </div>

              {/* Response from Perplexity API */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Response:</h3>
                {interaction.response === "Loading..." ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading response...</span>
                  </div>
                ) : (
                  <div 
                    className="text-gray-800 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: formatResponseWithClickableCitations(interaction.response, interaction.citations) 
                    }}
                  />
                )}
                
                {interaction.citations.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium text-base mb-2">Citations:</h4>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-blue-600">
                      {interaction.citations.map((citation, index) => (
                        <li key={index}>
                          <a 
                            href={citation} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {`[${index + 1}] ${citation}`}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Separator between interactions */}
              {index < interactions.length - 1 && (
                <div className="border-b border-gray-200 my-8" />
              )}
            </div>
          ))}
        </div>

        {/* Fixed Input Area */}
        <div className="p-2 bg-white border-b border-l border-r rounded-bl-lg rounded-br-lg">
          <div className="bg-white rounded-2xl border shadow-lg flex flex-col p-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your question here..."
              className="w-full outline-none px-3 py-2 text-slate-800 resize-none overflow-y-auto min-h-[80px] max-h-[160px]"
            />
            <div className="flex items-center justify-between mt-2 px-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 cursor-pointer hover:bg-slate-200">
                    <Search className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedModel}</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[150px]">
                  <DropdownMenuItem onClick={() => setSelectedModel("sonar")}>
                    sonar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedModel("sonar-pro")}>
                    sonar-pro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedModel("sonar-reasoning")}>
                    sonar-reasoning
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-slate-100 hover:bg-slate-200"
                onClick={handleApiCall}
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-2 w-2 text-slate-400 animate-spin" />
                ) : (
                  <ArrowUp className="h-2 w-2 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 