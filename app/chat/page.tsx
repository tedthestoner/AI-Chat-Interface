'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Copy, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  ArrowLeft, 
  Bot, 
  User,
  Loader2 
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  id: string
}

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      }
      setUser(user)
    }
    getUser()
  }, [supabase, router])

  // Load conversation from URL parameter
  useEffect(() => {
    const loadConversation = async () => {
      const convId = searchParams.get('id')
      if (!convId || !user) return

      setConversationId(convId)
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error loading messages:', error)
          toast.error('Failed to load conversation')
        } else if (data) {
          const loadedMessages: Message[] = data.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }))
          setMessages(loadedMessages)
          toast.success('Conversation loaded!')
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    loadConversation()
  }, [searchParams, user, supabase])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const createConversation = async (firstMessage: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
        })
      })
      const data = await response.json()
      if (data.conversation) {
        setConversationId(data.conversation.id)
        return data.conversation.id
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
    return null
  }

  const saveMessage = async (convId: string, role: string, content: string) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: convId,
          role,
          content
        })
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessageContent = input.trim()
    const userMessage: Message = {
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
      id: Date.now().toString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Create conversation if this is the first message
      let convId = conversationId
      if (!convId) {
        convId = await createConversation(userMessageContent)
      }

      // Save user message to database
      if (convId) {
        await saveMessage(convId, 'user', userMessageContent)
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageContent,
          messages: [...messages, userMessage]
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to get response'
        console.error('API Error:', errorMsg, data)
        toast.error(errorMsg)
        return
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        id: (Date.now() + 1).toString()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message to database
      if (convId) {
        await saveMessage(convId, 'assistant', data.content)
        toast.success('Conversation saved!')
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to send message. Please try again.'
      toast.error(errorMsg)
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadConversation = () => {
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`)
      .join('\n\n')
    
    const blob = new Blob([conversationText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${new Date().toISOString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Conversation downloaded!')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <h1 className="text-xl font-semibold">AI Chat Assistant</h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadConversation}
                disabled={messages.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 container mx-auto max-w-4xl p-4">
          <Card className="h-full flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Ask me anything! I'm here to help with your questions.
                  </p>
                  <div className="grid gap-2 w-full max-w-md">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => setInput("What can you help me with?")}
                    >
                      💡 What can you help me with?
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => setInput("Tell me an interesting fact")}
                    >
                      🎲 Tell me an interesting fact
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => setInput("Help me write a creative story")}
                    >
                      ✍️ Help me write a creative story
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : ''
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] space-y-2 ${
                          message.role === 'user' ? 'items-end' : ''
                        }`}
                      >
                        <div
                          className={`p-4 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.role === 'assistant' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[60px] max-h-[200px] resize-none"
                  disabled={loading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!input.trim() || loading}
                  className="px-4"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Powered by Google Gemini AI • Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatInterface />
    </Suspense>
  )
}
