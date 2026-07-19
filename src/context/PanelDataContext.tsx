import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { loadState, saveState, UnauthorizedError } from '../api';
import { useAuth } from './AuthContext';
import { DEFAULTS, DEFAULT_PROJECTS } from '../constants';
import type { AgentConfig, AgentKey, AgentStatus, ContentGrid, Project } from '../types';

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'proyecto'
  );
}

interface PanelDataValue {
  agentConfigs: Record<AgentKey, AgentConfig>;
  agentStatus: Record<AgentKey, AgentStatus | undefined>;
  contentGrid: ContentGrid | null;
  projects: Project[];
  activeProjectId: string;
  activeProjectName: string;
  setActiveProjectId: (id: string) => void;
  addProject: (name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  loading: boolean;
  refetch: () => Promise<void>;
}

const PanelDataContext = createContext<PanelDataValue | null>(null);

export function PanelDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, handleUnauthorized } = useAuth();
  const [agentConfigs, setAgentConfigs] = useState<Record<AgentKey, AgentConfig>>({ ...DEFAULTS });
  const [agentStatus, setAgentStatus] = useState<Record<AgentKey, AgentStatus | undefined>>({} as Record<AgentKey, AgentStatus | undefined>);
  const [contentGrid, setContentGrid] = useState<ContentGrid | null>(null);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState('chile-fly-fishing');
  const [loading, setLoading] = useState(true);
  const [rawState, setRawState] = useState<Record<string, unknown>>({});

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const state = await loadState<{
        agentConfigs?: Record<AgentKey, AgentConfig>;
        agentStatus?: Record<AgentKey, AgentStatus>;
        contentGrid?: ContentGrid | null;
        projects?: Project[];
      }>();
      setRawState(state as Record<string, unknown>);
      setAgentConfigs(state.agentConfigs || { ...DEFAULTS });
      setAgentStatus(state.agentStatus || ({} as Record<AgentKey, AgentStatus | undefined>));
      setContentGrid(state.contentGrid ?? null);
      setProjects(state.projects && state.projects.length ? state.projects : DEFAULT_PROJECTS);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        handleUnauthorized();
      } else {
        console.error('Error cargando el estado del panel', e);
      }
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  const addProject = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const next = [...projects, { id: `${slugify(trimmed)}-${Date.now().toString(36)}`, name: trimmed, protected: false }];
      setProjects(next);
      await saveState({ ...rawState, projects: next });
    },
    [projects, rawState]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const next = projects.filter((p) => p.id !== id);
      setProjects(next);
      if (activeProjectId === id) setActiveProjectId('chile-fly-fishing');
      await saveState({ ...rawState, projects: next });
    },
    [projects, rawState, activeProjectId]
  );

  const activeProjectName = projects.find((p) => p.id === activeProjectId)?.name || 'Chile Fly Fishing';

  return (
    <PanelDataContext.Provider
      value={{
        agentConfigs,
        agentStatus,
        contentGrid,
        projects,
        activeProjectId,
        activeProjectName,
        setActiveProjectId,
        addProject,
        deleteProject,
        loading,
        refetch,
      }}
    >
      {children}
    </PanelDataContext.Provider>
  );
}

export function usePanelData() {
  const ctx = useContext(PanelDataContext);
  if (!ctx) throw new Error('usePanelData debe usarse dentro de PanelDataProvider');
  return ctx;
}
