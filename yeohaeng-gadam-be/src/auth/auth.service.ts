import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import QueryString from 'qs';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { GoogleRequest } from './dto/auth.googleuser.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class authService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,

    ) { }


    //     async googleLogin(req) {
    //         if (!req.user) {
    //             throw new Error('No user from Google');
    //         }

    //         let user = await this.userRepository.findOne({ where: { email: req.user.email } });

    //         if (!user) {
    //             user = this.userRepository.create({
    //                 email: req.user.email,
    //                 firstName: req.user.firstName,
    //                 lastName: req.user.lastName,
    //                 picture: req.user.picture,
    //             });
    //             await this.userRepository.save(user);
    //         }

    //         return req.user;

    //     }
    // }
    async findByEmailOrSave(email: string, firstName: string, lastName: string, photo: string): Promise<User> {
        try {
            const foundMember = await this.userRepository.findOne({ where: { email } });
            if (foundMember) return foundMember;

            const newMember = this.userRepository.save({
                email: email,
                firstName: firstName,
                lastName: lastName,
                profileImage: photo,
            });
            return newMember;
        } catch (error) {
            throw new Error('사용자를 찾거나 생성하는데 실패하였습니다');
        }
    }

    async googleLogin(req): Promise<any> {
        const { email, firstName, lastName, photo } = req.user;
        // const fullName = firstName + lastName;
        const user: User = await this.findByEmailOrSave(email, firstName, lastName, photo); // 이메일로 가입된 회원을 찾고, 없다면 회원가입
        console.log("req.user: ", req.user);

        // JWT 토큰에 포함될 payload
        const payload = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.picture,
        };


        // JWT 토큰 생성
        const accessToken = this.jwtService.sign(payload, { expiresIn: 60 * 60, secret: process.env.JWT_SECRET_KEY });

        // 생성된 accessToken 로그로 출력
        console.log('Generated accessToken:', accessToken);

        return { access_token: accessToken };
    }

    async idCheck(id:string){
        const user :User[] = await this.userRepository.find({
            where: {
                id: Number(id),
            },
            take:1
        })
        if(user[0]){
            return true;
        }else{
            return false;
        }
    }
}