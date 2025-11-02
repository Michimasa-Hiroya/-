
export type RecurringType = 'none' | 'weekly' | 'biweekly';

export type Duration = 20 | 30 | 40 | 60 | 90;

export interface VisitEvent {
  id: string;
  title: string;
  startDateTime: number; // Stored as a timestamp for easy comparison and serialization
  duration: Duration;
  recurring: RecurringType;
  memo?: string;
}
