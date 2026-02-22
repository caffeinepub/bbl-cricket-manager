import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllTeams, useRegisterPlayer } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Upload, UserPlus } from 'lucide-react';
import { CategoryType, ExternalBlob } from '../backend.d';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: teams, isLoading: teamsLoading } = useGetAllTeams();
  const registerMutation = useRegisterPlayer();
  
  // Debug: log teams data
  console.log('Teams data:', teams);
  console.log('Teams loading:', teamsLoading);
  
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
  const [uploadProgress, setUploadProgress] = useState(0);
  
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
    
    if (!identity) {
      toast.error('Please login to register as a player');
      return;
    }
    
    if (!photoFile) {
      toast.error('Please upload a photo');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    try {
      // Convert file to bytes
      const arrayBuffer = await photoFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Create ExternalBlob with upload progress
      const photoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      
      await registerMutation.mutateAsync({
        name: formData.name,
        dob: formData.dob,
        place: formData.place,
        localResidence: formData.localResidence,
        photo: photoBlob,
        category: formData.category,
        teamId: BigInt(formData.teamId),
      });
      
      toast.success('Player registered successfully!');
      navigate({ to: '/players' });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register player. Please try again.');
    }
  };
  
  const isLoading = registerMutation.isPending;
  
  const categoryOptions = [
    { value: 'batting' as CategoryType, label: 'Batting' },
    { value: 'bowling' as CategoryType, label: 'Bowling' },
    { value: 'spinBowling' as CategoryType, label: 'Spin Bowling' },
    { value: 'allRounder' as CategoryType, label: 'All Rounder' },
  ];
  
  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-12 text-center space-y-4">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="font-display text-2xl">Login Required</h2>
            <p className="text-muted-foreground">
              Please login to register as a player
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-4xl text-primary tracking-wider mb-2">
            REGISTER AS PLAYER
          </h1>
          <p className="text-muted-foreground">
            Fill in your details to join the BBL Cricket Tournament
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl tracking-wider">Player Details</CardTitle>
            <CardDescription>
              All fields are required. Your photo will be displayed on your player card.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Player Photo</Label>
                <div className="flex items-start gap-4">
                  {photoPreview && (
                    <div className="w-24 h-24 border-2 border-border rounded overflow-hidden">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={isLoading}
                      className="rounded-sm"
                    />
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Uploading: {uploadProgress}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                  className="rounded-sm"
                />
              </div>
              
              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                  disabled={isLoading}
                  className="rounded-sm"
                />
              </div>
              
              {/* Place */}
              <div className="space-y-2">
                <Label htmlFor="place">Place</Label>
                <Input
                  id="place"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  placeholder="City/Town"
                  required
                  disabled={isLoading}
                  className="rounded-sm"
                />
              </div>
              
              {/* Local Residence */}
              <div className="space-y-2">
                <Label htmlFor="localResidence">Local Residential Name</Label>
                <Input
                  id="localResidence"
                  value={formData.localResidence}
                  onChange={(e) => setFormData({ ...formData, localResidence: e.target.value })}
                  placeholder="Neighborhood/Area"
                  required
                  disabled={isLoading}
                  className="rounded-sm"
                />
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Player Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as CategoryType })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="category" className="rounded-sm w-full">
                    <SelectValue placeholder="Select category" />
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
              
              {/* Team */}
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Select
                  value={formData.teamId}
                  onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                  disabled={isLoading || teamsLoading}
                >
                  <SelectTrigger id="team" className="rounded-sm w-full">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamsLoading && (
                      <div className="p-2 text-sm text-muted-foreground">Loading teams...</div>
                    )}
                    {!teamsLoading && (!teams || teams.length === 0) && (
                      <div className="p-2 text-sm text-muted-foreground">No teams available</div>
                    )}
                    {teams && teams.length > 0 && teams.map(team => (
                      <SelectItem key={team.id.toString()} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full rounded-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Player
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
