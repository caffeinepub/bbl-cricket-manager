import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Player, Team, Match, CategoryType, UserRole, ExternalBlob } from '../backend.d';

// ============= Teams =============

export function useGetAllTeams() {
  const { actor, isFetching } = useActor();
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeams();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============= Players =============

export function useGetAllPlayers() {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlayers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPlayersByTeam(teamId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ['players', 'team', teamId?.toString()],
    queryFn: async () => {
      if (!actor || teamId === null) return [];
      return actor.getPlayersByTeam(teamId);
    },
    enabled: !!actor && !isFetching && teamId !== null,
  });
}

export function useGetPlayersByCategory(category: CategoryType | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ['players', 'category', category],
    queryFn: async () => {
      if (!actor || category === null) return [];
      return actor.getPlayersByCategory(category);
    },
    enabled: !!actor && !isFetching && category !== null,
  });
}

export function useRegisterPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      dob: string;
      place: string;
      localResidence: string;
      photo: ExternalBlob;
      category: CategoryType;
      teamId: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerPlayer(
        data.name,
        data.dob,
        data.place,
        data.localResidence,
        data.photo as any,
        data.category,
        data.teamId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['topPerformers'] });
    },
  });
}

export function useUpdatePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      dob: string;
      place: string;
      localResidence: string;
      photo: ExternalBlob;
      category: CategoryType;
      teamId: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePlayer(
        data.id,
        data.name,
        data.dob,
        data.place,
        data.localResidence,
        data.photo as any,
        data.category,
        data.teamId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['topPerformers'] });
    },
  });
}

export function useDeletePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePlayer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['topPerformers'] });
    },
  });
}

// ============= Top Performers =============

export function useGetBestBatsman() {
  const { actor, isFetching } = useActor();
  return useQuery<Player | null>({
    queryKey: ['topPerformers', 'batsman'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getBestBatsman();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBestBowler() {
  const { actor, isFetching } = useActor();
  return useQuery<Player | null>({
    queryKey: ['topPerformers', 'bowler'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getBestBowler();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBestAllRounder() {
  const { actor, isFetching } = useActor();
  return useQuery<Player | null>({
    queryKey: ['topPerformers', 'allRounder'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getBestAllRounder();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ============= Matches =============

export function useGetAllMatches() {
  const { actor, isFetching } = useActor();
  return useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMatchDetails(matchId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Match | null>({
    queryKey: ['match', matchId?.toString()],
    queryFn: async () => {
      if (!actor || matchId === null) return null;
      return actor.getMatchDetails(matchId);
    },
    enabled: !!actor && !isFetching && matchId !== null,
  });
}

export function useCreateMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      team1: bigint;
      team2: bigint;
      date: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMatch(data.team1, data.team2, data.date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useRecordPlayerPerformance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      matchId: bigint;
      playerId: bigint;
      runs: bigint;
      wickets: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordPlayerPerformance(
        data.matchId,
        data.playerId,
        data.runs,
        data.wickets
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['topPerformers'] });
    },
  });
}

// ============= Authorization =============

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) return 'guest' as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adminSecret: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('Initializing admin with secret:', adminSecret ? '***' : '(empty)');
      
      try {
        // @ts-ignore - _initializeAccessControlWithSecret exists but not in types
        const result = await actor._initializeAccessControlWithSecret(adminSecret);
        console.log('Admin initialization result:', result);
        return result;
      } catch (error: any) {
        console.error('Admin initialization error:', error);
        
        // Check if the error is about missing CAFFEINE_ADMIN_TOKEN
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('CAFFEINE_ADMIN_TOKEN') || errorMessage.includes('environment variable')) {
          throw new Error('ENVIRONMENT_VARIABLE_MISSING: The CAFFEINE_ADMIN_TOKEN environment variable is not configured. Please contact your system administrator or check the deployment configuration.');
        }
        
        // Check if admin is already assigned
        if (errorMessage.includes('already assigned') || errorMessage.includes('Admin already exists')) {
          throw new Error('ADMIN_EXISTS: An admin has already been assigned for this system. Please contact the existing administrator for access.');
        }
        
        // Generic error
        throw new Error(errorMessage || 'Failed to initialize admin access');
      }
    },
    onSuccess: async () => {
      console.log('Admin initialization successful, invalidating queries');
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['userRole'] });
      
      // Reload the page after a short delay to ensure the UI updates
      setTimeout(() => {
        console.log('Reloading page to refresh admin status');
        window.location.reload();
      }, 1000);
    },
  });
}
