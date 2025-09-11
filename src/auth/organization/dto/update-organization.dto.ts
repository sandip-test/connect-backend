import { PartialType } from '@nestjs/mapped-types';
import { OrganizationRegistrationDto } from './organization-registration.dto';

// PartialType makes all properties of OrganizationRegistrationDto optional.
export class UpdateOrganizationDto extends PartialType(OrganizationRegistrationDto) {}