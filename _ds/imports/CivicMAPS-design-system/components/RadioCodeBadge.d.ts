/** Radio-code badge with progressive disclosure: code is primary and always visible; the paired label is hidden until tap/click/touch expands the badge (owner ruling). Visual tier drives colour only; codes are configuration, not component semantics (S01-COD-001). */
interface RadioCodeBadgeProps {
  /** Displayed code, e.g. "CODE 2" */
  code: string;
  /** Human label, e.g. "Available" */
  label: string;
  /** Presentation tier (DR-04) */
  tier?: 'emergency' | 'urgent' | 'directive' | 'alert-interactive' | 'presence' | 'comms' | 'work';
  /** Render with the label already revealed */
  defaultExpanded?: boolean;
}
export declare function RadioCodeBadge(props: RadioCodeBadgeProps): JSX.Element;
