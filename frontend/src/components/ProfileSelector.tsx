import React from 'react';
import { type UserProfile } from '../hooks/useChat';

interface ProfileSelectorProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

const NEEDS_OPTIONS = ['wheelchair', 'braille', 'sign_language', 'visual_impaired'];

export function ProfileSelector({ profile, onChange }: ProfileSelectorProps) {
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...profile, language: e.target.value });
  };

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...profile, venueId: e.target.value });
  };

  const handleNeedsChange = (need: string) => {
    const currentNeeds = profile.needs || [];
    if (currentNeeds.includes(need)) {
      onChange({ ...profile, needs: currentNeeds.filter(n => n !== need) });
    } else {
      onChange({ ...profile, needs: [...currentNeeds, need] });
    }
  };

  return (
    <section className="profile-selector" aria-labelledby="profile-heading">
      <h2 id="profile-heading">Visitor Profile</h2>
      
      <div className="form-group">
        <label htmlFor="language-select">Preferred Language</label>
        <select id="language-select" value={profile.language || 'en'} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="es">Español (Spanish)</option>
          <option value="fr">Français (French)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="venue-select">Venue</label>
        <select id="venue-select" value={profile.venueId || ''} onChange={handleVenueChange}>
          <option value="">Select a venue...</option>
          <option value="v-metlife">MetLife Stadium</option>
          <option value="v-azteca">Estadio Azteca</option>
          <option value="v-bmo">BMO Field</option>
        </select>
      </div>

      <fieldset className="form-group">
        <legend>Accessibility Needs</legend>
        <div className="needs-group">
          {NEEDS_OPTIONS.map(need => (
            <div key={need} className="checkbox-item">
              <input
                type="checkbox"
                id={`need-${need}`}
                checked={(profile.needs || []).includes(need)}
                onChange={() => handleNeedsChange(need)}
              />
              <label htmlFor={`need-${need}`}>
                {need.replace('_', ' ')}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
