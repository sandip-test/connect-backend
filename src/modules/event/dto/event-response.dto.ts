import { Expose, Type } from 'class-transformer';

export class OrganizationResponse {
    @Expose()
    id: string;

    @Expose()
    organizationName: string;

    @Expose()
    organizationLogoPath: string;

    @Expose()
    organizationWebsite: string;

    // Add more fields here if needed
}


export class EventResponse {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    venue: string;

    @Expose()
    date: Date;

    @Expose()
    category: string;

    @Expose()
    eventType: string;

    @Expose()
    attendeesCount: number;

    @Expose()
    startDate: Date;

    @Expose()
    endDate: Date;

    @Expose()
    state: string;

    @Expose()
    visibility: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    @Type(() => OrganizationResponse)
    organization: OrganizationResponse;
}
