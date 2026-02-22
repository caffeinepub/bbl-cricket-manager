import { useState, useMemo } from 'react';
import { useGetAllTeams, useGetAllPlayers, useGetBestBatsman, useGetBestBowler, useGetBestAllRounder } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Target, Zap } from 'lucide-react';
import type { Player } from '../backend.d';

function TopPerformerCard({ 
  player, 
  title, 
  stat, 
  statLabel,
  icon: Icon,
  color 
}: { 
  player: Player | null | undefined; 
  title: string; 
  stat: string; 
  statLabel: string;
  icon: React.ElementType;
  color: string;
}) {
  const { data: teams } = useGetAllTeams();
  const team = teams?.find(t => t.id === player?.teamId);
  
  if (!player) {
    return (
      <Card className="stat-card border-2">
        <CardContent className="stat-card-content p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`stat-card border-2 ${color} shadow-lg hover:shadow-xl transition-shadow`}>
      <CardContent className="stat-card-content p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border-2 border-background">
            <AvatarImage src={player.photo.getDirectURL()} alt={player.name} />
            <AvatarFallback className="text-lg font-display">
              {player.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-accent" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
            </div>
            
            <h3 className="font-display text-2xl text-foreground mb-1 truncate">
              {player.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="rounded-sm text-xs">
                {team?.name || 'Unknown Team'}
              </Badge>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl text-primary">
                {stat}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {statLabel}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const { data: teams } = useGetAllTeams();
  const team = teams?.find(t => t.id === player.teamId);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={player.photo.getDirectURL()} alt={player.name} />
            <AvatarFallback className="text-sm font-display">
              {player.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{player.name}</h4>
            <p className="text-xs text-muted-foreground">{team?.name}</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl text-primary">
                {Number(player.totalRuns)}
              </span>
              <span className="text-xs text-muted-foreground">R</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl text-accent">
                {Number(player.totalWickets)}
              </span>
              <span className="text-xs text-muted-foreground">W</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  
  const { data: teams, isLoading: teamsLoading } = useGetAllTeams();
  const { data: players, isLoading: playersLoading } = useGetAllPlayers();
  const { data: bestBatsman, isLoading: batsmanLoading } = useGetBestBatsman();
  const { data: bestBowler, isLoading: bowlerLoading } = useGetBestBowler();
  const { data: bestAllRounder, isLoading: allRounderLoading } = useGetBestAllRounder();
  
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    if (selectedTeamId === 'all') return players;
    return players.filter(p => p.teamId.toString() === selectedTeamId);
  }, [players, selectedTeamId]);
  
  const isLoading = teamsLoading || playersLoading || batsmanLoading || bowlerLoading || allRounderLoading;
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-6xl md:text-8xl text-primary tracking-wider">
          BBL CRICKET
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track players, matches, and statistics for the BBL Cricket Tournament
        </p>
      </div>
      
      {/* Top Performers Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent" />
          <h2 className="font-display text-3xl text-foreground tracking-wider">
            TOP PERFORMERS
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopPerformerCard
            player={bestBatsman}
            title="Best Batsman"
            stat={bestBatsman ? Number(bestBatsman.totalRuns).toString() : '0'}
            statLabel="runs"
            icon={Target}
            color="border-primary"
          />
          
          <TopPerformerCard
            player={bestBowler}
            title="Best Bowler"
            stat={bestBowler ? Number(bestBowler.totalWickets).toString() : '0'}
            statLabel="wickets"
            icon={Zap}
            color="border-accent"
          />
          
          <TopPerformerCard
            player={bestAllRounder}
            title="Best All Rounder"
            stat={
              bestAllRounder
                ? `${Number(bestAllRounder.totalRuns)}/${Number(bestAllRounder.totalWickets)}`
                : '0/0'
            }
            statLabel="runs/wkts"
            icon={Trophy}
            color="border-success"
          />
        </div>
      </section>
      
      {/* Team Filter Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-foreground tracking-wider">
            PLAYERS
          </h2>
          
          <div className="w-64">
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="rounded-sm">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams?.map(team => (
                  <SelectItem key={team.id.toString()} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {playersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPlayers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No players found. Register players to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map(player => (
              <PlayerCard key={player.id.toString()} player={player} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
