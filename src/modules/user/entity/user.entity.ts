import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Role } from 'src/common/enums/role.enum';
import { Sponsor } from 'src/auth/sponsor/entities/sponsor.entity';
import { Organization } from 'src/auth/organization/entities/organization.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToOne(() => Organization, organization => organization.user, { nullable: true, cascade: true })
  @JoinColumn()
  organization: Organization;

  @OneToOne(() => Sponsor, sponsor => sponsor.user, { nullable: true, cascade: true })
  @JoinColumn()
  sponsor: Sponsor;

  // Password hashing hook
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }
}
