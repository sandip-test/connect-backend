import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Organization } from 'src/auth/organization/entities/organization.entity';
import { Sponsor } from 'src/auth/sponsor/entities/sponsor.entity';
import { InvitationStatus } from 'src/common/enums/invitation-status.enum';
/**
 * EventInvitation Entity
 * Represents an invitation to an event for a specific user.
 */

@Entity('event_invitation')
@Unique(['event', 'sponsor']) // prevent duplicate invitations
export class EventInvitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Event, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' })
    event: Event;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invited_to' })
    sponsor: Sponsor;

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invited_by' })
    invitedByOrg: Organization;

    @Column({ type: 'enum', enum: InvitationStatus, default: InvitationStatus.PENDING })
    status: InvitationStatus;

    @Column({ type: 'text', nullable: true })
    message?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}