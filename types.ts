
export type RecurringType = 'none' | 'weekly' | 'biweekly';

export type Duration = 20 | 30 | 40 | 60 | 90;

export interface OverriddenOccurrence {
  originalDate: number; // Start of day timestamp of the original occurrence
  startDateTime: number; // New start date time
  duration: Duration;
  memo?: string;
  title?: string;
}

export interface VisitEvent {
  id: string;
  title: string;
  startDateTime: number; // Stored as a timestamp for easy comparison and serialization
  duration: Duration;
  recurring: RecurringType;
  memo?: string;
  deletedOccurrences?: number[]; // Array of timestamps (start of day) for deleted single events
  overriddenOccurrences?: OverriddenOccurrence[]; // Array of overridden occurrences
  endDate?: number;
  uid: string;
}
