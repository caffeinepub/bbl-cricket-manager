import { useGetAllMatches, useGetAllTeams } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar, ChevronRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { Match } from '../backend.d';

function MatchCard({ match }: { match: Match }) {
  const { data: teams } = useGetAllTeams();
  const team1 = teams?.find(t => t.id === match.team1);
  const team2 = teams?.find(t => t.id === match.team2);
  
  const date = new Date(Number(match.date) / 1000000); // Convert nanoseconds to milliseconds
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  const performancesCount = match.performances.length;
  
  return (
    <Link to={`/matches/${match.id.toString()}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formattedDate}</span>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <span className="font-display text-2xl text-foreground">
                  {team1?.name || 'Unknown'}
                </span>
                <span className="text-muted-foreground font-bold">VS</span>
                <span className="font-display text-2xl text-foreground">
                  {team2?.name || 'Unknown'}
                </span>
              </div>
              
              <Badge variant="secondary" className="rounded-sm">
                {performancesCount} {performancesCount === 1 ? 'Performance' : 'Performances'} Recorded
              </Badge>
            </div>
            
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MatchesPage() {
  const { data: matches, isLoading } = useGetAllMatches();
  
  // Sort matches by date (most recent first)
  const sortedMatches = matches
    ? [...matches].sort((a, b) => Number(b.date - a.date))
    : [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-primary tracking-wider">
            MATCH HISTORY
          </h1>
        </div>
        <p className="text-muted-foreground">
          View all matches and player performances
        </p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedMatches.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl mb-2">No Matches Yet</h3>
            <p className="text-muted-foreground">
              Matches will appear here once they are created by admins
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedMatches.map(match => (
            <MatchCard key={match.id.toString()} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
