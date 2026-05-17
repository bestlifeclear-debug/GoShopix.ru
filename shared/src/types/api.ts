export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export interface HealthCheck {
  status: 'ok';
  service: string;
  timestamp: string;
  environment?: string;
}

export interface ReadinessCheck {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  checks: {
    database: 'ok' | 'error';
  };
}
