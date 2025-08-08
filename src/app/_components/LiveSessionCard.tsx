import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Card, CardContent } from '@/components/ui/card'
import { Users, Play } from 'lucide-react'
import React from 'react'
import { mockLiveSessions } from '../constants'

const LiveSessionCard = ({ session }: { session: typeof mockLiveSessions[0] }) => {
  return (
    <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-red-500 hover:bg-red-600">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            LIVE
          </Badge>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            {session.viewerCount}
          </div>
        </div>
        
        <h3 className="font-semibold mb-1">{session.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{session.description}</p>
        
        <Button size="sm" className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Join Live
        </Button>
      </CardContent>
    </Card>
  )
}

export default LiveSessionCard
