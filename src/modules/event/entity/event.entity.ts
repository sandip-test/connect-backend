import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Sector } from '../../../common/enums';
import { EventType, EventVisibility } from '../../../common/enums';
import { Organization } from 'src/auth/organization/entities/organization.entity';
// import { Sponsor } from 'src/auth/sponsor/entities/sponsor.entity';

@Entity('event')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    venue: string;

    @Column()
    date: Date;

    @Column({ type: 'enum', enum: Sector, name: 'category', default: Sector.OTHERS })
    category: Sector;

    @Column({ type: 'enum', enum: EventType, name: 'event_type', default: EventType.INPERSON })
    eventType: EventType;

    @Column({ name: "attendees_count", default: 100 })
    attendeesCount: number;

    @Column({ name: 'start_date' })
    startDate: Date;

    @Column({ name: 'end_date' })
    endDate: Date;

    @Column({ name: "state" })
    state: String;

    @Column({ type: 'enum', enum: EventVisibility, name: 'visibility' , default: EventVisibility.PUBLIC})
    visibility: EventVisibility;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @ManyToOne(() => Organization, (organization) => organization.events, {
        nullable: false,
        cascade: true, // Allows cascading operations
    })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;
}