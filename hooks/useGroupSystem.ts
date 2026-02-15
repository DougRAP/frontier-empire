import { useState, useEffect, useCallback } from 'react';
import { PlayerGroup } from '../types';
import { groupService } from '../services/groupService';
import { trackEvent } from '../services/analytics';

export function useGroupSystem() {
  const [currentGroup, setCurrentGroup] = useState<PlayerGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    const loadGroup = async () => {
      try {
        const group = await groupService.getCurrentGroup();
        setCurrentGroup(group);
      } catch (err) {
        console.error("Failed to load group", err);
      } finally {
        setLoading(false);
      }
    };
    loadGroup();
  }, []);

  const createGroup = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const group = await groupService.createGroup(name);
      setCurrentGroup(group);
      trackEvent('group_created', { groupId: group.id, name });
    } catch (err) {
      setError("Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const joinGroup = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const group = await groupService.joinGroup(code);
      setCurrentGroup(group);
      trackEvent('group_joined', { groupId: group.id });
    } catch (err: any) {
      setError(err.message || "Failed to join group.");
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveGroup = useCallback(async () => {
    setLoading(true);
    try {
      await groupService.leaveGroup();
      setCurrentGroup(null);
      trackEvent('group_left', {});
    } catch (err) {
      setError("Failed to leave group.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  return {
    currentGroup,
    loading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
    clearError
  };
}
