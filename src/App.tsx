import { useState, useEffect, useRef } from 'react'
import { Bot, Send, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

interface ChatbotState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}

function App() {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    error: null
  })
  const [inputMessage, setInputMessage] = useState('')
  const [sessionId, setSessionId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let storedSessionId = localStorage.getItem('chatbot-session-id')
    if (!storedSessionId) {
      storedSessionId = uuidv4()
      localStorage.setItem('chatbot-session-id', storedSessionId)
    }
    setSessionId(storedSessionId)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [state.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || state.isLoading) return

    const userMessage: Message = {
      id: uuidv4(),
      content: inputMessage.trim(),
      isBot: false,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }))

    setInputMessage('')

    try {
      const webhookUrl = 'https://n8n-service-pa9k.onrender.com/webhook/433709cf-fbc1-4a64-84aa-e9cdea16b6f5'

      console.log('Sending webhook request:', {
        url: webhookUrl,
        sessionId,
        message: userMessage.content
      })

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          message: userMessage.content
        })
      })

      console.log('Webhook response status:', response.status)
      console.log('Webhook response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Webhook error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const responseData = await response.json()
      console.log('Webhook response data:', responseData)
      
      const responseText = responseData.message || responseData.response || JSON.stringify(responseData)
      
      const botMessage: Message = {
        id: uuidv4(),
        content: responseText,
        isBot: true,
        timestamp: new Date()
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false
      }))

    } catch (error) {
      console.error('Fetch error:', error)
      let errorMessage = 'An unknown error occurred'
      
      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.name === 'TypeError') {
          errorMessage = 'Network error: Check if n8n workflow is active and CORS is enabled'
        } else {
          errorMessage = error.message
        }
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Chatbot Assistant v1.1</h1>
            <p className="text-sm text-gray-500">Always here to help</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {state.messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to the Chatbot!</h3>
            <p className="text-gray-500">Send a message to get started.</p>
          </div>
        )}
        
        {state.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isBot
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'bg-blue-500 text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.isBot ? 'text-gray-500' : 'text-blue-100'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {state.isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-sm border border-gray-200 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="mx-6 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm">Error: {state.error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 font-medium text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={sendMessage} className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={state.isLoading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={state.isLoading || !inputMessage.trim()}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
