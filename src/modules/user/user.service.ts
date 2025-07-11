import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Finds a user by their email address.
   * @param email - The email of the user to find.
   * @returns The user if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Finds a user by their ID.
   * @param id - The UUID of the user.
   * @returns The user if found, otherwise null.
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}