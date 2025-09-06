import { Injectable, NotFoundException, Logger, Body, ForbiddenException, ParamData } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Organization } from 'src/auth/organization/entities/organization.entity';
import { Event } from './entity/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { EventResponse } from './dto/event-response.dto';
import { plainToInstance } from 'class-transformer';


@Injectable()
export class EventService {
    private readonly logger = new Logger(EventService.name);

    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        private readonly dataSource: DataSource,
    ) { }


    //Create Event Function
    async createEvent(@Body() dto: CreateEventDto): Promise<EventResponse> {
        this.logger.log('Creating a new event');

        //Find the organization that is creating the event
        const organization = await this.organizationRepository.findOne({
            where: { id: dto.organization },
        });
        //  If the organization does not exist, throw an error
        if (!organization) {
            throw new NotFoundException(`Organization with ID "${dto.organization}" not found`);
        }

        // Create and save the new event
        const newEvent = this.eventRepository.create({
            ...dto,
            organization
        });
        const event = await this.eventRepository.save(newEvent);

        // Return the created event as an EventResponse DTO which removes unnecessary fields
        return plainToInstance(EventResponse, event, { excludeExtraneousValues: true })
    }


    //Get Event by EventID
    async getEventById(id: string): Promise<EventResponse> {
        this.logger.log(`Fetching event with ID: ${id}`);
        const event = await this.eventRepository.findOne({ where: { id }, relations: ['organization'] });
        console.log("the organization of the found event is", event?.organization);
        if (!event) {
            throw new NotFoundException(`Event with ID "${id}" not found.`);
        }
        return plainToInstance(EventResponse, event, { excludeExtraneousValues: true });;
    }

    //Get All the events
    async getAllEvents(): Promise<EventResponse[]> {
        this.logger.log('Fetching all events');

        const events = await this.eventRepository.find({ relations: ['organization'] })
        return plainToInstance(EventResponse, events, { excludeExtraneousValues: true })
    };

    async updateEvent(id: ParamData, eventData: Partial<Event>, req): Promise<EventResponse> {
        this.logger.log("Updating event with id", id);
        const existingEvent = (req as any).event; // event was attached in the guard

        const updatedEvent = this.eventRepository.merge(existingEvent, eventData);
        const savedEvent = await this.eventRepository.save(updatedEvent);
        return plainToInstance(EventResponse, savedEvent, { excludeExtraneousValues: true });
    }

    //Delete event by id
    //Protected by Event Ownership guard in Controller
    async deleteEvent(id: string): Promise<void> {
        this.logger.log(`Deleting event with ID: ${id}`);
        const result = await this.eventRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Event with ID "${id}" not found.`);
        }
    }

}
