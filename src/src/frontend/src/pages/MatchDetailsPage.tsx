import { useParams, Link } from '@tanstack/react-router';
import { useGetMatchDetails, useGetAllTeams, useGetAllPlayers } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, Trophy } from 'lucide-react';
import type { MatchPerformance } from '../backend.d';

function PerformanceRow({ performance }: { performance: MatchPerformance }) {
  const { data: players } = useGetAllPlayers();
  const { data: teams } = useGetAllTeams();
  
  const player = players?.find(p => p.id === performance.playerId);
  const team = player ? teams?.find(t => t.id === player.teamId) : null;
  
  if (!player) return null;
  
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={player.photo.getDirectURL()} alt={player.name} />
            <AvatarFallback className="text-xs font-display">
              {player.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{player.name}</p>
            <p className="text-xs text-muted-foreground">{team?.name}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-display text-2xl text-primary">
          {Number(performance.runs)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-display text-2xl text-accent">
          {Number(performance.wickets)}
        </span>
      </TableCell>
    </TableRow>
  );
}

export default function MatchDetailsPage() {
  const { matchId } = useParams({ from: '/matches/$matchId' });
  const { data: match, isLoading: matchLoading } = useGetMatchDetails(
    matchId ? BigInt(matchId) : null
  );
  const { data: teams } = useGetAllTeams();
  
  if (matchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl mb-2">Match Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested match could not be found
            </p>
            <Link to="/matches">
              <Button>Back to Matches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const team1 = teams?.find(t => t.id === match.team1);
  const team2 = teams?.find(t => t.id === match.team2);
  
  const date = new Date(Number(match.date) / 1000000);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/matches">
          <Button variant="ghost" className="mb-4 rounded-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matches
          </Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
          </div>
          <CardTitle className="font-display text-3xl tracking-wider">
            {team1?.name || 'Unknown'} VS {team2?.name || 'Unknown'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="rounded-sm text-base px-4 py-2">
              {match.performances.length} {match.performances.length === 1 ? 'Performance' : 'Performances'}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl tracking-wider">
            PLAYER PERFORMANCES
          </CardTitle>
        </CardHeader>
        <CardContent>
          {match.performances.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No player performances recorded yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Runs</TableHead>
                  <TableHead className="text-center">Wickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {match.performances.map((performance, index) => (
                  <PerformanceRow
                    key={`${performance.playerId.toString()}-${index}`}
                    performance={performance}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
