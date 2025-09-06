import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Sector, BranchType } from 'src/common/enums';
import { User } from 'src/modules/user/entity/user.entity';
import { Event } from 'src/modules/event/entity/event.entity';
/**
 * Organization Entity
 * Represents organizations registered in the system and its relationship with the User entity
 */
@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_name', length: 100 })
  organizationName: string;

  @Column({ name: 'organization_website', length: 255 })
  organizationWebsite: string;

  @Column({ name: 'head_of_organization', length: 50 })
  headOfOrganization: string;

  @Column({ name: 'head_contact_number', length: 20 })
  headContactNumber: string;

  @Column({ name: 'year_of_establishment', type: 'int' })
  yearsOfEstablishment: number;

  @Column({ name: 'registration_number', length: 50, unique: true })
  registrationNumber: string;

  @Column({ name: 'email_address', length: 100, unique: true })
  emailAddress: string;

  @Column('simple-array', { name: 'sectors_you_work_in' })
  sectorsYouWorkIn: Sector[];

  @Column({ name: 'other_sectors', length: 100, nullable: true })
  otherSectors: string;

  @Column({ name: 'phone_number', length: 20 })
  phoneNumber: string;

  @Column({ name: 'address', length: 200 })
  address: string;

  @Column({ name: 'branch_or_main', type: 'enum', enum: BranchType })
  branchOrMain: BranchType;

  @Column({ name: 'location', length: 100 })
  location: string;

  @Column({ name: 'organization_logo_path', length: 255 })
  organizationLogoPath: string;

  @Column({ name: 'organization_logo_public_id', length: 255, nullable: true })
  organizationLogoPublicId: string;

  @Column({ name: 'registration_certificate_path', length: 255 })
  registrationCertificatePath: string;

  @Column({ name: 'registration_certificate_public_id', length: 255, nullable: true })
  registrationCertificatePublicId: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships between Organization and User
  @OneToOne(() => User, (user) => user.organization)
  @JoinColumn({ name: 'user_id' })
  user: User;

  //Relationsship between Organization and Event 
  @OneToMany(() => Event, (event) => event.organization, {
    nullable: true,
  })
  events?: Event[];
}