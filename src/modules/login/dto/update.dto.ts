import { IsString, IsInt, Length, IsNumberString } from 'class-validator';

export class UpdateDto {
  @IsNumberString()
  id: number;

  @Length(0, 50)
  @IsString()
  name: string;

  @IsString()
  password: string;
}
