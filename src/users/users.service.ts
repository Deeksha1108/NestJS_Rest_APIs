import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from './interfaces/api-response.interface';
import { HTTP_STATUS, MESSAGES } from '../common/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    try {
      const user = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(user);
      return {
        statusCode: HTTP_STATUS.CREATED,
        message: MESSAGES.USER.CREATED,
        data: savedUser,
      };
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ApiResponse<User>> {
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
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
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
