import type { EmailCampaign, EmailContact } from '../../types';

export interface Segment {
  key: string;
  label: string;
  filter: (c: EmailContact) => boolean;
}

export function computeTags(contacts: EmailContact[]): string[] {
  const tagSet = new Set<string>();
  contacts.forEach((c) => (c.tags || []).forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function managementSegments(contacts: EmailContact[]): Segment[] {
  const segs: Segment[] = [
    { key: 'all', label: 'Todos', filter: () => true },
    { key: 'subscribed', label: 'Suscritos activos', filter: (c) => c.status === 'subscribed' },
    { key: 'unsubscribed', label: 'No suscritos', filter: (c) => c.status === 'unsubscribed' },
    { key: 'bounced', label: 'Rebotados', filter: (c) => c.status === 'bounced' },
  ];
  computeTags(contacts).forEach((tag) => segs.push({ key: `tag:${tag}`, label: tag, filter: (c) => (c.tags || []).includes(tag) }));
  return segs;
}

export function segmentFromKey(key: string): { type: string; value?: string } {
  if (key.startsWith('tag:')) return { type: 'tag', value: key.slice(4) };
  return { type: 'all' };
}

export function statusLabel(status: string): string {
  return { sent: 'Enviada', sending: 'Enviando', draft: 'Borrador', scheduled: 'Programada' }[status] || status;
}

export function contactStatusLabel(status: string): string {
  return { subscribed: 'Suscrito', unsubscribed: 'No suscrito', bounced: 'Rebotado' }[status] || status;
}

export function sentCampaigns(campaigns: EmailCampaign[]): EmailCampaign[] {
  return campaigns.filter((c) => c.status === 'sent');
}
