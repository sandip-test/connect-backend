/**
 * Interface for registration response
 * Standardizes the response format for all registration endpoints
 */
export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    organizationName?: string;
    companyName?: string;
    emailAddress: string;
    registrationNumber: string;
    isVerified: boolean;
    createdAt: Date;
  };
}