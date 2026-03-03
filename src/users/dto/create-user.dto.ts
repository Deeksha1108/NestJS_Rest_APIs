import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Deeksha'})
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'deeksha123@gmail.com'})
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 23})
  @IsNotEmpty()
  @IsInt()
  @Min(10)
  age: number;
}
