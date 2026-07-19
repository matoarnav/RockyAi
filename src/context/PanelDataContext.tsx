import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { loadState, saveState, callAction, UnauthorizedError } from '../api';
import { useAuth } from './AuthContext';
import { DEFAULTS, DEFAULT_PROJECTS, AGENT_FUNCTION_KEYS } from '../constants';
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
  activeProject: Project | undefined;
  setActiveProjectId: (id: string) => void;
  addProject: (name: string, agents?: AgentKey[]) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  scopedAction: <T = unknown>(action: string, extra?: Record<string, unknown>) => Promise<T>;
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
  const activeProjectIdRef = useRef(activeProjectId);
  activeProjectIdRef.current = activeProjectId;

  const refetch = useCallback(async () => {
    const requestedProjectId = activeProjectIdRef.current;
    setLoading(true);
    try {
      const state = await loadState<{
        agentConfigs?: Record<AgentKey, AgentConfig>;
        agentStatus?: Record<AgentKey, AgentStatus>;
        contentGrid?: ContentGrid | null;
        projects?: Project[];
      }>(requestedProjectId);
      // Si el usuario cambio de proyecto mientras esta respuesta viajaba, la
      // descartamos - ya no corresponde al proyecto activo y no debe pisar
      // el estado que si corresponde.
      if (activeProjectIdRef.current !== requestedProjectId) return;
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
      if (activeProjectIdRef.current === requestedProjectId) setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeProjectId, refetch]);

  const scopedAction = useCallback(
    <T = unknown,>(action: string, extra?: Record<string, unknown>) =>
      callAction<T>(action, { ...extra, project_id: activeProjectId }),
    [activeProjectId]
  );

  const addProject = useCallback(
    async (name: string, agents: AgentKey[] = AGENT_FUNCTION_KEYS) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const next = [...projects, { id: `${slugify(trimmed)}-${Date.now().toString(36)}`, name: trimmed, protected: false, agents }];
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

  const updateProject = useCallback(
    async (id: string, patch: Partial<Project>) => {
      const next = projects.map((p) => (p.id === id ? { ...p, ...patch } : p));
      setProjects(next);
      await saveState({ ...rawState, projects: next });
    },
    [projects, rawState]
  );

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeProjectName = activeProject?.name || 'Chile Fly Fishing';

  return (
    <PanelDataContext.Provider
      value={{
        agentConfigs,
        agentStatus,
        contentGrid,
        projects,
        activeProjectId,
        activeProjectName,
        activeProject,
        setActiveProjectId,
        addProject,
        deleteProject,
        updateProject,
        scopedAction,
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
