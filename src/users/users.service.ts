import {
  ConflictException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from './interfaces/api-response.interface';
import { MESSAGES } from '../common/constants';
import { AuditLog } from './entities/audit-log.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const user = manager.create(User, createUserDto);
        const savedUser = await manager.save(user);

        const auditLog = manager.create(AuditLog, {
          action: 'USER_CREATED',
          userId: savedUser.id,
        });

        await manager.save(auditLog);
        // throw new Error('Force rollback test'); // rollback test -> agr koi failure aata h then auto rollback ho jayega user creation
        this.logger.log(`User created successfully with ID: ${savedUser.id}`);
        return {
          statusCode: HttpStatus.CREATED,
          message: MESSAGES.USER.CREATED,
          data: plainToInstance(User, savedUser),
        };
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        this.logger.warn(`Email already exists: ${createUserDto.email}`);
        throw new ConflictException(MESSAGES.USER.EMAIL_EXISTS);
      }
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<ApiResponse<User[]>> {
    this.logger.log('Fetching all users');
    const users = await this.userRepository.find();
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.USER.RETRIEVED_ALL,
      data: users.map((user) => plainToInstance(User, user)),
    };
  }

  async findOne(id: string): Promise<ApiResponse<User>> {
    this.logger.log(`Fetching user with ID: ${id}`);
    const user = await this.findUserById(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.USER.RETRIEVED,
      data: plainToInstance(User, user),
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    this.logger.log(`Updating user with ID: ${id}`);
    try {
      const user = await this.findUserById(id);
      Object.assign(user, updateUserDto);
      const updatedUser = await this.userRepository.save(user);
      this.logger.log(`User updated successfully with ID: ${id}`);
      return {
        statusCode: HttpStatus.OK,
        message: MESSAGES.USER.UPDATED,
        data: plainToInstance(User, updatedUser),
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        this.logger.warn(`Email already exists during update for user ID: ${id}`);
        throw new ConflictException(MESSAGES.USER.EMAIL_EXISTS);
      }
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    this.logger.log(`Deleting user with ID: ${id}`);
    const user = await this.findUserById(id);
    await this.userRepository.remove(user);
    this.logger.log(`User deleted successfully with ID: ${id}`);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGES.USER.DELETED,
      data: null,
    };
  }

  private async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    return user;
  }
}
