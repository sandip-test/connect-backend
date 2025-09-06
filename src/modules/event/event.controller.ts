import { Controller, Get, Param, Patch, UseGuards, HttpStatus, ParseUUIDPipe, Delete, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { Event } from './entity/event.entity';
import { JwtAuthGuard } from 'src/config/guards/jwt-auth.guard';
import { RolesGuard } from 'src/config/guards/roles.guard';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Roles } from 'src/config/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { EventResponse } from './dto/event-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { EventOwnerGuard } from 'src/config/guards/event-ownership.guard';

@ApiTags('Event')
@ApiBearerAuth() // Indicates that JWT is required
@Controller('event')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
@Roles(Role.ORGANIZATION, Role.ADMIN) // Specify that ORGANIZATION and ADMIN roles are allowed
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post('create')
    @ApiOperation({ summary: 'Create a new event' })
    @ApiBody(
        {
            description: "Event creation data",
            type: CreateEventDto
        }
    )
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Event created successfully.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
    createEvent(@Body() event: CreateEventDto): Promise<EventResponse> {
        return this.eventService.createEvent(event);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get event by ID' })
    @ApiParam({ name: 'id', description: 'Event UUID' })
    @ApiResponse({ status: 200, description: 'Event details.' })
    @ApiResponse({ status: 404, description: 'Event not found.' })
    getEventById(@Param('id', ParseUUIDPipe) id: string) {
        return this.eventService.getEventById(id);
    }

    @Get('')
    @ApiOperation({ summary: 'Get all events' })
    @ApiResponse({ status: 200, description: 'List of all events.' })
    getAllEvents() {
        return this.eventService.getAllEvents();
    }

    @Patch(':id')
    @UseGuards(EventOwnerGuard) // Custom guard to check if the user owns the event or is an admin
    @ApiOperation({ summary: 'Update an event' })
    @ApiParam({ name: 'id', description: 'Event UUID' })
    @ApiResponse({ status: 200, description: 'Event updated successfully.' })
    @ApiResponse({ status: 404, description: 'Event not found.' })
    updateEvent(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() eventData: Partial<Event>,
        @Req() request
    ) {
        return this.eventService.updateEvent(id, eventData, request);
    }

    @Delete(':id')
    @UseGuards(EventOwnerGuard)
    @ApiOperation({ summary: 'Delete an event' })
    @ApiParam({ name: 'id', description: 'Event UUID' })
    @ApiResponse({ status: 200, description: 'Event deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Event not found.' })
    deleteEvent(@Param('id', ParseUUIDPipe) id: string) {
        return this.eventService.deleteEvent(id);
    }
}
