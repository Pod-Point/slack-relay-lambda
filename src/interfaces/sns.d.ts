export interface CloudwatchMessage {
    AlarmName: string;
    NewStateValue: string;
    StateChangeTime: string;
}

export interface EventMessage {
    'Event Source': string;
    'Event Time': string;
    'Identifier Link': string;
    'Source ID': string;
    'Event ID': string;
    'Event Message': string;
}
