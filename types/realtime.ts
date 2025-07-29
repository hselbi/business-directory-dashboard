// types/realtime.ts - Enhanced types for bot integration

export interface BotStatus {
  phase:
    | "IDLE"
    | "INITIALIZING"
    | "PROCESSING_SUBMISSIONS"
    | "COMPLETED"
    | "ERROR";
  isRunning: boolean;
  connectedClients: number;
  serverUptime: number;
  timestamp: string;
}

export interface BusinessProgress {
  businessName: string;
  site: string;
  currentStep:
    | "INITIALIZING"
    | "CONNECTING_GMAIL"
    | "CREATING_ACCOUNT"
    | "UPLOADING_IMAGES"
    | "FILLING_FORMS"
    | "WAITING_EMAIL"
    | "VERIFYING_EMAIL"
    | "COMPLETED"
    | "FAILED";
  stepMessage: string;
  progress: number; // 0-100
  startTime: string;
  lastUpdate: string;
  imagesCount: number;
  gmailStatus: "CONNECTED" | "DISCONNECTED" | "VERIFYING" | "VERIFIED";
  generatedPassword: string;
  errors: string[];
  verificationUrl?: string;
  submissionData?: {
    email: string;
    password: string;
    businessInfo: any;
    submittedImages: string[];
  };
}

export interface ProgressSummary {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  pending: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "phase"
    | "business"
    | "submission";
  business?: string;
  details?: any;
}

export interface PhaseChangeEvent {
  oldPhase: string;
  newPhase: string;
  timestamp: string;
}

export interface ProgressEvent {
  businessName: string;
  site: string;
  percentage: number;
  step: string;
  message: string;
}

// Socket.IO event types
export interface ServerToClientEvents {
  statusUpdate: (status: BotStatus) => void;
  phaseChange: (data: PhaseChangeEvent) => void;
  progress: (data: ProgressEvent) => void;
  businessProgress: (progress: BusinessProgress) => void;
  log: (logData: LogEntry) => void;
}

export interface ClientToServerEvents {
  startBot: () => void;
  stopBot: () => void;
  requestStatus: () => void;
}
