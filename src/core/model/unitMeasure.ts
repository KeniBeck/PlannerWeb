export interface UnitMeasure {
    id?: number;
    name: string;
    status?: UnitMeasureStatus;
}

enum UnitMeasureStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}