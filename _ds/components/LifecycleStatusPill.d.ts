/** SR lifecycle status pill — 11 server-enforced Code21 states, token-backed (F20). Flow: Received → Dispatched·Not Active (push sent) → Dispatched·Active (push acknowledged) → In Progress → Attended → fork (No Report | PIN Issued) → SR Closed → Completed. */
interface LifecycleStatusPillProps {
  status?: 'RECEIVED' | 'DISPATCHED_NOT_ACTIVE' | 'DISPATCHED_ACTIVE' | 'IN_PROGRESS' | 'ATTENDED' | 'PIN_ISSUED' | 'NO_REPORT' | 'COMPLETED' | 'VOIDED' | 'CANCELLED' | 'CLOSED';
}
export declare function LifecycleStatusPill(props: LifecycleStatusPillProps): JSX.Element;
