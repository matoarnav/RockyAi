export interface PmsRoom {
  id: string;
  label: string;
  category: string;
}

// Inventario real de habitaciones por lodge (no hay un modelo de
// Inventario en el backend todavía — se pausó junto con la integración
// a Booking.com por costo, ver memoria). Mientras tanto, esta lista fija
// alimenta el calendario de disponibilidad. Si un lodge no tiene entrada
// acá, el calendario deriva las habitaciones de los RoomID que ya
// aparecen en sus reservas (ver PmsCalendario.tsx).
export const LODGE_ROOMS: Record<string, PmsRoom[]> = {
  'alto-castillo': [
    { id: 'Suite Principal', label: 'Suite Principal', category: '45m² · Super King · vista al Parque Nacional' },
    { id: 'Deluxe Superior', label: 'Deluxe Superior', category: 'Categoría premium · cama adicional' },
    { id: 'Deluxe Terraza 1', label: 'Deluxe Terraza 1', category: '34m² · terraza escénica' },
    { id: 'Deluxe Terraza 2', label: 'Deluxe Terraza 2', category: '34m² · terraza escénica' },
    { id: 'Standard', label: 'Standard', category: '30m² · vista a Cerro Castillo' },
  ],
};
