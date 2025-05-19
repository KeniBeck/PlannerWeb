export interface FaultFilterDTO{
    type?: Failures[];
    startDate?: string;
    endDate?: string;
    search?: string;
    activatePaginated?: boolean;
}

enum Failures {
  INASSISTANCE = 'INASSISTANCE',
  IRRESPECTFUL = 'IRRESPECTFUL',
  ABANDONMENT = 'ABANDONMENT',
}