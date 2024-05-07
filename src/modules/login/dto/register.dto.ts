import { IsString, IsInt, Length, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @Length(6, 30)
  @IsString()
  // 不能为空
  @IsNotEmpty()
  // 增加校验规则
  // /^[a-zA-Z0-9#$%_-]+$/
  @Matches(/^[a-zA-Z0-9#$%_-]+$/, {
    message: '用户名只能是字母、数字或者 #、$、%、_、- 这些字符',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 30)
  password: string;
}
