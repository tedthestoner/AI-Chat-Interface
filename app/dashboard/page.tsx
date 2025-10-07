'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, User, LogOut, Plus, Clock, TrendingUp, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(10)

        if (error) {
          console.error('Error fetching conversations:', error)
        } else {
          setConversations(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchConversations()
  }, [user, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/auth/login')
    router.refresh()
  }

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to chat page
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return
    }

    try {
      const response = await fetch(`/api/conversations?id=${convId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Conversation deleted successfully')
        // Remove from state
        setConversations(prev => prev.filter(c => c.id !== convId))
      } else {
        toast.error('Failed to delete conversation')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An error occurred while deleting')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Navigation Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold">AI Chat Dashboard</h1>
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" size="sm">Chat</Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 mb-8">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Welcome back!</CardTitle>
              <CardDescription>
                Start a new conversation or continue where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button size="lg" className="w-full sm:w-auto">
                  <Plus className="h-5 w-5 mr-2" />
                  Start New Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversations.length}</div>
                <p className="text-xs text-muted-foreground">
                  {conversations.length === 0 ? 'No conversations yet' : 
                   conversations.length === 1 ? '1 conversation' : 
                   `${conversations.length} conversations`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Active</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Today</div>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Status</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">Google AI API connected</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Conversations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                {conversations.length > 0 ? 'Click to continue a conversation' : 'Your chat history will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start chatting to see your history here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="group">
                      <Link href={`/chat?id=${conv.id}`}>
                        <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{conv.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Last updated: {new Date(conv.updated_at).toLocaleDateString()} at {new Date(conv.updated_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="relative w-5 h-5 flex-shrink-0 ml-4">
                              <MessageSquare className="h-5 w-5 text-muted-foreground absolute inset-0 group-hover:opacity-0 transition-opacity" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
                                onClick={(e) => handleDeleteConversation(conv.id, e)}
                              >
                                <Trash2 className="h-5 w-5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
