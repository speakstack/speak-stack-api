import { Controller, Get } from "@nestjs/common";
import { Public, ApiSuccessMessage } from "../common";

interface HealthStatus {
  status: string;
  timestamp: string;
}

/**
 * Health check controller for monitoring API status.
 * Publicly accessible without authentication.
 */
@Controller("health")
export class HealthController {
  @Public()
  @Get()
  @ApiSuccessMessage("API is running")
  checkHealth(): HealthStatus {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  }
}
