import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from './interfaces/api-response.interface';
import { HTTP_STATUS, MESSAGES } from '../common/constants';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
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
        return {
          statusCode: HTTP_STATUS.CREATED,
          message: MESSAGES.USER.CREATED,
          data: savedUser,
        };
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new ConflictException(MESSAGES.USER.EMAIL_EXISTS);
      }
      throw error;
    }
  }

  async findAll(): Promise<ApiResponse<User[]>> {
    const users = await this.userRepository.find();
    return {
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.USER.RETRIEVED_ALL,
      data: users,
    };
  }

  async findOne(id: string): Promise<ApiResponse<User>> {
    const user = await this.findUserById(id);
    return {
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.USER.RETRIEVED,
      data: user,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.findUserById(id);
      Object.assign(user, updateUserDto);
      const updatedUser = await this.userRepository.save(user);
      return {
        statusCode: HTTP_STATUS.OK,
        message: MESSAGES.USER.UPDATED,
        data: updatedUser,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new ConflictException(MESSAGES.USER.EMAIL_EXISTS);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const user = await this.findUserById(id);
    await this.userRepository.remove(user);
    return {
      statusCode: HTTP_STATUS.OK,
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
