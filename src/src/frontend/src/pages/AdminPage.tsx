import { useState } from 'react';
import { useIsCallerAdmin, useGetAllTeams, useGetAllMatches, useGetAllPlayers, useCreateMatch, useRecordPlayerPerformance, useUpdatePlayer, useDeletePlayer, usePromoteToAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Shield, Plus, Edit, Trash2, Loader2, UserPlus, Info } from 'lucide-react';
import { CategoryType, ExternalBlob } from '../backend';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function CreateMatchTab() {
  const { data: teams } = useGetAllTeams();
  const createMatchMutation = useCreateMatch();
  
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    date: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.team1 === formData.team2) {
      toast.error('Teams must be different');
      return;
    }
    
    try {
      const dateObj = new Date(formData.date);
      const nanoTimestamp = BigInt(dateObj.getTime()) * BigInt(1000000);
      
      await createMatchMutation.mutateAsync({
        team1: BigInt(formData.team1),
        team2: BigInt(formData.team2),
        date: nanoTimestamp,
      });
      
      toast.success('Match created successfully!');
      setFormData({ team1: '', team2: '', date: '' });
    } catch (error) {
      console.error('Create match error:', error);
      toast.error('Failed to create match');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Match</CardTitle>
        <CardDescription>
          Schedule a match between two teams
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team1">Team 1</Label>
            <Select
              value={formData.team1}
              onValueChange={(value) => setFormData({ ...formData, team1: value })}
            >
              <SelectTrigger id="team1" className="rounded-sm">
                <SelectValue placeholder="Select team 1" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map(team => (
                  <SelectItem key={team.id.toString()} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="team2">Team 2</Label>
            <Select
              value={formData.team2}
              onValueChange={(value) => setFormData({ ...formData, team2: value })}
            >
              <SelectTrigger id="team2" className="rounded-sm">
                <SelectValue placeholder="Select team 2" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map(team => (
                  <SelectItem key={team.id.toString()} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="matchDate">Match Date</Label>
            <Input
              id="matchDate"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="rounded-sm"
            />
          </div>
          
          <Button type="submit" disabled={createMatchMutation.isPending} className="w-full rounded-sm">
            {createMatchMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Match
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function UpdateScoresTab() {
  const { data: matches } = useGetAllMatches();
  const { data: players } = useGetAllPlayers();
  const recordPerformanceMutation = useRecordPlayerPerformance();
  
  const [selectedMatch, setSelectedMatch] = useState('');
  const [formData, setFormData] = useState({
    playerId: '',
    runs: '',
    wickets: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await recordPerformanceMutation.mutateAsync({
        matchId: BigInt(selectedMatch),
        playerId: BigInt(formData.playerId),
        runs: BigInt(formData.runs),
        wickets: BigInt(formData.wickets),
      });
      
      toast.success('Performance recorded successfully!');
      setFormData({ playerId: '', runs: '', wickets: '' });
    } catch (error) {
      console.error('Record performance error:', error);
      toast.error('Failed to record performance');
    }
  };
  
  const sortedMatches = matches
    ? [...matches].sort((a, b) => Number(b.date - a.date))
    : [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Match Scores</CardTitle>
        <CardDescription>
          Record player performance for a match
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="match">Select Match</Label>
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger id="match" className="rounded-sm">
                <SelectValue placeholder="Select a match" />
              </SelectTrigger>
              <SelectContent>
                {sortedMatches.map(match => (
                  <SelectItem key={match.id.toString()} value={match.id.toString()}>
                    Match #{match.id.toString()} - {new Date(Number(match.date) / 1000000).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedMatch && (
            <>
              <div className="space-y-2">
                <Label htmlFor="player">Player</Label>
                <Select
                  value={formData.playerId}
                  onValueChange={(value) => setFormData({ ...formData, playerId: value })}
                >
                  <SelectTrigger id="player" className="rounded-sm">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players?.map(player => (
                      <SelectItem key={player.id.toString()} value={player.id.toString()}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="runs">Runs Scored</Label>
                <Input
                  id="runs"
                  type="number"
                  min="0"
                  value={formData.runs}
                  onChange={(e) => setFormData({ ...formData, runs: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wickets">Wickets Taken</Label>
                <Input
                  id="wickets"
                  type="number"
                  min="0"
                  value={formData.wickets}
                  onChange={(e) => setFormData({ ...formData, wickets: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              
              <Button type="submit" disabled={recordPerformanceMutation.isPending} className="w-full rounded-sm">
                {recordPerformanceMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Performance
                  </>
                )}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function EditPlayerTab() {
  const { data: players } = useGetAllPlayers();
  const { data: teams } = useGetAllTeams();
  const updatePlayerMutation = useUpdatePlayer();
  
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    place: '',
    localResidence: '',
    category: '' as CategoryType | '',
    teamId: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
    const player = players?.find(p => p.id.toString() === playerId);
    if (player) {
      setFormData({
        name: player.name,
        dob: player.dob,
        place: player.place,
        localResidence: player.localResidence,
        category: player.category,
        teamId: player.teamId.toString(),
      });
      setPhotoPreview(player.photo.getDirectURL());
      setPhotoFile(null);
    }
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const player = players?.find(p => p.id.toString() === selectedPlayer);
    if (!player) return;
    
    try {
      let photoBlob = player.photo;
      
      if (photoFile) {
        const arrayBuffer = await photoFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        photoBlob = ExternalBlob.fromBytes(bytes);
      }
      
      await updatePlayerMutation.mutateAsync({
        id: BigInt(selectedPlayer),
        name: formData.name,
        dob: formData.dob,
        place: formData.place,
        localResidence: formData.localResidence,
        photo: photoBlob,
        category: formData.category as CategoryType,
        teamId: BigInt(formData.teamId),
      });
      
      toast.success('Player updated successfully!');
      setSelectedPlayer('');
      setPhotoFile(null);
      setPhotoPreview('');
    } catch (error) {
      console.error('Update player error:', error);
      toast.error('Failed to update player');
    }
  };
  
  const categoryOptions = [
    { value: 'batting' as CategoryType, label: 'Batting' },
    { value: 'bowling' as CategoryType, label: 'Bowling' },
    { value: 'spinBowling' as CategoryType, label: 'Spin Bowling' },
    { value: 'allRounder' as CategoryType, label: 'All Rounder' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Player</CardTitle>
        <CardDescription>
          Update player information and statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="selectPlayer">Select Player</Label>
            <Select value={selectedPlayer} onValueChange={handlePlayerSelect}>
              <SelectTrigger id="selectPlayer" className="rounded-sm">
                <SelectValue placeholder="Choose a player" />
              </SelectTrigger>
              <SelectContent>
                {players?.map(player => (
                  <SelectItem key={player.id.toString()} value={player.id.toString()}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPlayer && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editPhoto">Player Photo</Label>
                <div className="flex items-start gap-4">
                  {photoPreview && (
                    <div className="w-24 h-24 border-2 border-border rounded overflow-hidden">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <Input
                    id="editPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="rounded-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editName">Full Name</Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDob">Date of Birth</Label>
                <Input
                  id="editDob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editPlace">Place</Label>
                <Input
                  id="editPlace"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editResidence">Local Residence</Label>
                <Input
                  id="editResidence"
                  value={formData.localResidence}
                  onChange={(e) => setFormData({ ...formData, localResidence: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editCategory">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as CategoryType })}
                >
                  <SelectTrigger id="editCategory" className="rounded-sm">
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
              
              <div className="space-y-2">
                <Label htmlFor="editTeam">Team</Label>
                <Select
                  value={formData.teamId}
                  onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                >
                  <SelectTrigger id="editTeam" className="rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map(team => (
                      <SelectItem key={team.id.toString()} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" disabled={updatePlayerMutation.isPending} className="w-full rounded-sm">
                {updatePlayerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Player
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DeletePlayerTab() {
  const { data: players } = useGetAllPlayers();
  const deletePlayerMutation = useDeletePlayer();
  
  const [selectedPlayer, setSelectedPlayer] = useState('');
  
  const handleDelete = async () => {
    try {
      await deletePlayerMutation.mutateAsync(BigInt(selectedPlayer));
      toast.success('Player deleted successfully!');
      setSelectedPlayer('');
    } catch (error) {
      console.error('Delete player error:', error);
      toast.error('Failed to delete player');
    }
  };
  
  const player = players?.find(p => p.id.toString() === selectedPlayer);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Player</CardTitle>
        <CardDescription>
          Permanently remove a player from the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deletePlayer">Select Player</Label>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger id="deletePlayer" className="rounded-sm">
                <SelectValue placeholder="Choose a player to delete" />
              </SelectTrigger>
              <SelectContent>
                {players?.map(player => (
                  <SelectItem key={player.id.toString()} value={player.id.toString()}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {player && (
            <div className="p-4 border border-destructive rounded-sm bg-destructive/10">
              <p className="text-sm text-muted-foreground mb-3">
                You are about to delete:
              </p>
              <p className="font-semibold text-lg">{player.name}</p>
              <p className="text-sm text-muted-foreground">
                {player.totalRuns.toString()} runs, {player.totalWickets.toString()} wickets
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full mt-4 rounded-sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Player
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the player
                      and all their performance data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deletePlayerMutation.isPending}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {deletePlayerMutation.isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AdminPromotionSection() {
  const { identity } = useInternetIdentity();
  const promoteToAdminMutation = usePromoteToAdmin();
  const [adminSecret, setAdminSecret] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  
  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identity) {
      toast.error('Please log in first');
      return;
    }
    
    try {
      console.log('Starting admin promotion...');
      await promoteToAdminMutation.mutateAsync(adminSecret);
      toast.success('Successfully promoted to admin! Refreshing page...');
      setAdminSecret('');
    } catch (error) {
      console.error('Promotion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      
      // Show user-friendly error messages
      if (errorMessage.includes('ENVIRONMENT_VARIABLE_MISSING')) {
        toast.error('Admin setup incomplete. The CAFFEINE_ADMIN_TOKEN environment variable needs to be configured. Contact your system administrator.', {
          duration: 8000,
        });
      } else if (errorMessage.includes('ADMIN_EXISTS')) {
        toast.error('An admin already exists for this system. Please contact them for access.', {
          duration: 5000,
        });
      } else {
        toast.error(`Failed to promote to admin: ${errorMessage}`, {
          duration: 5000,
        });
      }
    }
  };
  
  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-primary" />
              Become Admin
            </CardTitle>
            <CardDescription>
              Initialize yourself as the first administrator
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showInstructions && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Admin Setup Requirements</AlertTitle>
            <AlertDescription className="space-y-2 text-sm">
              <p className="font-medium">Environment Configuration Required:</p>
              <p>
                The admin system requires the <code className="bg-muted px-1 py-0.5 rounded">CAFFEINE_ADMIN_TOKEN</code> environment 
                variable to be set during deployment. This ensures secure admin initialization.
              </p>
              
              <p className="font-medium mt-3">How it works:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>The first person to click "Initialize as Admin" and provide the correct token becomes the admin</li>
                <li>The token must match the value set in the environment variable</li>
                <li>Once an admin is assigned, no other users can become admin through this interface</li>
              </ul>
              
              <p className="font-medium mt-3 text-destructive">Troubleshooting:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>If you see "environment variable" errors, the token hasn't been configured</li>
                <li>Contact your system administrator or check your deployment configuration</li>
                <li>For local development, set the env var in your dfx.json or .env file</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handlePromote} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminSecret">Admin Token (required)</Label>
            <Input
              id="adminSecret"
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter the admin token from your system administrator"
              className="rounded-sm"
              required
            />
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-muted rounded-sm">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              You must enter the correct admin token that matches the CAFFEINE_ADMIN_TOKEN 
              environment variable set during deployment. Only the first person with the correct 
              token will become admin.
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={promoteToAdminMutation.isPending}
            className="w-full rounded-sm"
          >
            {promoteToAdminMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Initialize as Admin
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-primary tracking-wider">
              ADMIN ACCESS
            </h1>
          </div>
          <p className="text-muted-foreground">
            You need admin privileges to access this panel
          </p>
        </div>
        
        <AdminPromotionSection />
        
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Not an admin?</h3>
            <p className="text-sm text-muted-foreground">
              If you're the first user of this system, you can initialize yourself as admin above.
              Otherwise, please contact an existing administrator to grant you access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl text-primary tracking-wider">
            ADMIN PANEL
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage matches, players, and performance data
        </p>
      </div>
      
      <Tabs defaultValue="create-match" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="create-match">Create Match</TabsTrigger>
          <TabsTrigger value="update-scores">Update Scores</TabsTrigger>
          <TabsTrigger value="edit-player">Edit Player</TabsTrigger>
          <TabsTrigger value="delete-player">Delete Player</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create-match">
          <CreateMatchTab />
        </TabsContent>
        
        <TabsContent value="update-scores">
          <UpdateScoresTab />
        </TabsContent>
        
        <TabsContent value="edit-player">
          <EditPlayerTab />
        </TabsContent>
        
        <TabsContent value="delete-player">
          <DeletePlayerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
