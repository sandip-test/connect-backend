import { PartialType } from '@nestjs/mapped-types';
import { SponsorRegistrationDto } from './sponsor-registration.dto';

// PartialType makes all properties of SponsorRegistrationDto optional.
export class UpdateSponsorDto extends PartialType(SponsorRegistrationDto) {}