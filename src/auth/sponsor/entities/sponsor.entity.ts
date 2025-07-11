import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Sector, CompanyType } from 'src/common/enums';
import { User } from 'src/modules/user/entity/user.entity';

/**
 * Sponsor Entity
 * Represents sponsors registered in the system and its relationship with the User entity
 */
@Entity('sponsors')
export class Sponsor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_name', length: 100 })
  companyName: string;

  @Column({ name: 'company_type', type: 'enum', enum: CompanyType })
  companyType: CompanyType;

  @Column({ name: 'year_of_establishment', type: 'int' }) 
  yearsOfEstablishment: number;

  @Column({ name: 'registration_number', length: 50, unique: true })
  registrationNumber: string;

  @Column({ name: 'email_address', length: 100, unique: true })
  emailAddress: string;

  @Column({ name: 'phone_number', length: 20 })
  phoneNumber: string;

  @Column({ name: 'company_address', length: 200 })
  companyAddress: string;

  @Column({ name: 'company_website', length: 255 })
  companyWebsite: string;

  @Column('simple-array', { name: 'sectors_of_work' })
  sectorsOfWork: Sector[];

  @Column({ name: 'other_work_sectors', length: 100, nullable: true })
  otherWorkSectors: string;

  @Column('simple-array', { name: 'sectors_interested_to_sponsor' })
  sectorsInterestedToSponsor: Sector[];

  @Column({ name: 'other_sponsorship_sectors', length: 100, nullable: true })
  otherSponsorshipSectors: string;

  @Column({ name: 'company_logo_path', length: 255 })
  companyLogoPath: string;

  @Column({ name: 'company_logo_public_id', length: 255, nullable: true })
  companyLogoPublicId: string;

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

  //Relationships between Sponsor and User
  @OneToOne(() => User, (user) => user.sponsor)
  @JoinColumn({ name: 'user_id' }) 
  user: User;
}