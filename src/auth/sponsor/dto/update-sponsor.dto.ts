import { PartialType } from '@nestjs/swagger';
import { SponsorRegistrationDto } from './sponsor-registration.dto';

// PartialType makes all properties of SponsorRegistrationDto optional.
export class UpdateSponsorDto extends PartialType(SponsorRegistrationDto) {}