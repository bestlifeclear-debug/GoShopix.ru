import { MapPin } from 'lucide-react';
import './addresses.css';

export function PickupMapThumb() {
  return (
    <div className="addr-card__map" aria-hidden>
      <div className="addr-card__map-grid" />
      <div className="addr-card__map-pin">
        <MapPin size={16} className="text-[#FF7062]" strokeWidth={2.25} />
      </div>
    </div>
  );
}
