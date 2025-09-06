import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { EventService } from 'src/modules/event/event.service';
import { Role } from 'src/common/enums/role.enum';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class EventOwnerGuard implements CanActivate {
    constructor(
        private readonly eventService: EventService,
        private readonly userService: UserService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const eventId = request.params.id;

        // Fetch event
        const event = await this.eventService.getEventById(eventId);
        if (!event) {
            throw new NotFoundException(`Event with ID "${eventId}" not found.`);
        }

        // Attach the event to the request object
        request.event = event;

        // Fetch user data to get organization info
        const userData = await this.userService.findById(user.id);
        const userOrg = userData?.organization;

        // Allow admins OR the event's owning org
        if (user.role === Role.ADMIN || event.organization === userOrg) {
            return true;
        }

        throw new ForbiddenException('You are not authorized to access this event.');
    }
}
