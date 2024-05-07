import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class OauthClientDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;
}
