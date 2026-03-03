import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('get')
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('get/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put('put/:id')
  @ApiOperation({ summary: 'Replace user completely' })
  updateFull(
    @Param('id') id: string,
    @Body() updateUserDto: CreateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('patch/:id')
  @ApiOperation({ summary: 'Partially update user' })
  updatePartial(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete user by ID' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
