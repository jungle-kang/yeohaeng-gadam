import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    // async canActivate(context: any): Promise<boolean> {
    //     // 부모 클래스의 메서드 사용
    //     const result = (await super.canActivate(context)) as boolean;
    //     // 컨텍스트에서 리퀘스트 객체를 꺼냄
    //     const request = context.switchToHttp().getRequest();
    //     await super.logIn(request);
    //     console.log('googleAuthGuard');
    //     return result;
    // }
}