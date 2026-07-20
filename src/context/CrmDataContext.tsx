import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { UnauthorizedError } from '../api';
import { useAuth } from './AuthContext';
import { usePanelData } from './PanelDataContext';
import type { EmailCampaign, EmailContact, EmailJourney, EmailTemplate } from '../types';

interface CrmDataValue {
  contacts: EmailContact[];
  templates: EmailTemplate[];
  campaigns: EmailCampaign[];
  journeys: EmailJourney[];
  loading: boolean;
  refetch: () => Promise<void>;
  scopedAction: <T = unknown>(action: string, extra?: Record<string, unknown>) => Promise<T>;
}

const CrmDataContext = createContext<CrmDataValue | null>(null);

export function CrmDataProvider({ children }: { children: ReactNode }) {
  const { handleUnauthorized } = useAuth();
  const { activeProjectId, scopedAction } = usePanelData();
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [journeys, setJourneys] = useState<EmailJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const activeProjectIdRef = useRef(activeProjectId);
  activeProjectIdRef.current = activeProjectId;

  const refetch = useCallback(async () => {
    const requestedProjectId = activeProjectIdRef.current;
    setLoading(true);
    try {
      const [c, t, k, j] = await Promise.all([
        scopedAction<{ contacts: EmailContact[] }>('list_email_contacts'),
        scopedAction<{ templates: EmailTemplate[] }>('list_email_templates'),
        scopedAction<{ campaigns: EmailCampaign[] }>('list_email_campaigns'),
        scopedAction<{ journeys: EmailJourney[] }>('list_email_journeys'),
      ]);
      // Igual que en PanelDataContext: si el proyecto activo cambio mientras
      // esta respuesta viajaba, se descarta - ya no corresponde.
      if (activeProjectIdRef.current !== requestedProjectId) return;
      setContacts(c.contacts || []);
      setTemplates(t.templates || []);
      setCampaigns(k.campaigns || []);
      setJourneys(j.journeys || []);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        handleUnauthorized();
      } else {
        console.error('Error cargando datos del CRM', e);
      }
    } finally {
      if (activeProjectIdRef.current === requestedProjectId) setLoading(false);
    }
  }, [handleUnauthorized, scopedAction]);

  useEffect(() => {
    refetch();
  }, [refetch, activeProjectId]);

  return (
    <CrmDataContext.Provider value={{ contacts, templates, campaigns, journeys, loading, refetch, scopedAction }}>
      {children}
    </CrmDataContext.Provider>
  );
}

export function useCrmData() {
  const ctx = useContext(CrmDataContext);
  if (!ctx) throw new Error('useCrmData debe usarse dentro de CrmDataProvider');
  return ctx;
}
