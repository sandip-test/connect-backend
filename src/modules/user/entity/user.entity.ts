import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Role } from '../../../common/enums/role.enum';
import { Organization } from 'src/auth/organization/entities/organization.entity';
import { Sponsor } from 'src/auth/sponsor/entities/sponsor.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Exclude password from any response automatically
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relationships ---
  @OneToOne(() => Organization, (organization)=>organization.user, {
    cascade: true,
    nullable: true,
  })
  organization?: Organization;

  @OneToOne(() => Sponsor, (sponsor) => sponsor.user, {
    cascade: true,
    nullable: true,
  })
  sponsor?: Sponsor;

  // --- Hooks ---
  @BeforeInsert()
  async hashPassword() {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  // --- Methods ---
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}