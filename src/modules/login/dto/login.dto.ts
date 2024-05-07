import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  @IsString()
  public name: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @IsString({
    message: '密码必须为字符串',
  })
  public password: string;

  @IsOptional()
  @IsString()
  public clientId?: string;

  @IsOptional()
  @IsString()
  public responseType?: string;

  @IsOptional()
  @IsString()
  public redirectUri?: string;
}
