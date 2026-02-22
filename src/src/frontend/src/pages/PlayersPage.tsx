import { useState, useMemo } from 'react';
import { useGetAllPlayers, useGetAllTeams } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Filter } from 'lucide-react';
import type { Player, CategoryType } from '../backend.d';

function PlayerDetailCard({ player }: { player: Player }) {
  const { data: teams } = useGetAllTeams();
  const team = teams?.find(t => t.id === player.teamId);
  
  const categoryLabels: Record<CategoryType, string> = {
    batting: 'Batting',
    bowling: 'Bowling',
    spinBowling: 'Spin Bowling',
    allRounder: 'All Rounder',
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Avatar className="h-24 w-24 border-2 border-border">
            <AvatarImage src={player.photo.getDirectURL()} alt={player.name} />
            <AvatarFallback className="text-xl font-display">
              {player.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-display text-2xl text-foreground mb-1">
                {player.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-sm">
                  {team?.name || 'Unknown Team'}
                </Badge>
                <Badge variant="outline" className="rounded-sm">
                  {categoryLabels[player.category]}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total Runs
                </p>
                <p className="font-display text-3xl text-primary">
                  {Number(player.totalRuns)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total Wickets
                </p>
                <p className="font-display text-3xl text-accent">
                  {Number(player.totalWickets)}
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border space-y-1 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium">DOB:</span> {player.dob}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Place:</span> {player.place}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Residence:</span> {player.localResidence}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlayersPage() {
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const { data: players, isLoading: playersLoading } = useGetAllPlayers();
  const { data: teams, isLoading: teamsLoading } = useGetAllTeams();
  
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    
    let filtered = players;
    
    if (filterTeam !== 'all') {
      filtered = filtered.filter(p => p.teamId.toString() === filterTeam);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }
    
    return filtered;
  }, [players, filterTeam, filterCategory]);
  
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'batting', label: 'Batting' },
    { value: 'bowling', label: 'Bowling' },
    { value: 'spinBowling', label: 'Spin Bowling' },
    { value: 'allRounder', label: 'All Rounder' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-primary tracking-wider">
            ALL PLAYERS
          </h1>
        </div>
        <p className="text-muted-foreground">
          Browse all registered players in the BBL Cricket Tournament
        </p>
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Team</span>
          </div>
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="rounded-sm">
              <SelectValue />
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
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Category</span>
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Players List */}
      {playersLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-24 rounded" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl mb-2">No Players Found</h3>
            <p className="text-muted-foreground">
              {filterTeam !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'No players have been registered yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPlayers.map(player => (
            <PlayerDetailCard key={player.id.toString()} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
