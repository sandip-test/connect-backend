import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Organization } from 'src/auth/organization/entities/organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entity/event.entity';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([Organization, Event, User])],
    controllers: [EventController],
    providers: [EventService, UserService],

})
export class EventModule { }
