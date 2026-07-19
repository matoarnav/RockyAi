import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { callAction, UnauthorizedError } from '../api';
import { useAuth } from './AuthContext';
import type { EmailCampaign, EmailContact, EmailTemplate } from '../types';

interface CrmDataValue {
  contacts: EmailContact[];
  templates: EmailTemplate[];
  campaigns: EmailCampaign[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const CrmDataContext = createContext<CrmDataValue | null>(null);

export function CrmDataProvider({ children }: { children: ReactNode }) {
  const { handleUnauthorized } = useAuth();
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [c, t, k] = await Promise.all([
        callAction<{ contacts: EmailContact[] }>('list_email_contacts'),
        callAction<{ templates: EmailTemplate[] }>('list_email_templates'),
        callAction<{ campaigns: EmailCampaign[] }>('list_email_campaigns'),
      ]);
      setContacts(c.contacts || []);
      setTemplates(t.templates || []);
      setCampaigns(k.campaigns || []);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        handleUnauthorized();
      } else {
        console.error('Error cargando datos del CRM', e);
      }
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return <CrmDataContext.Provider value={{ contacts, templates, campaigns, loading, refetch }}>{children}</CrmDataContext.Provider>;
}

export function useCrmData() {
  const ctx = useContext(CrmDataContext);
  if (!ctx) throw new Error('useCrmData debe usarse dentro de CrmDataProvider');
  return ctx;
}
