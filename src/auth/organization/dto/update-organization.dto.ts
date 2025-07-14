import { PartialType } from '@nestjs/swagger';
import { OrganizationRegistrationDto } from './organization-registration.dto';

// PartialType makes all properties of OrganizationRegistrationDto optional.
export class UpdateOrganizationDto extends PartialType(OrganizationRegistrationDto) {}