/** Presence badge (DR-04): available = green; active-offline = grey on green (on duty, connectivity lost); inactive = grey (signed off). Passive presence is never amber. */
interface PresenceIndicatorProps {
  /** Presence state */
  state?: 'available' | 'active-offline' | 'inactive';
  size?: 'sm' | 'md';
}
export declare function PresenceIndicator(props: PresenceIndicatorProps): JSX.Element;
