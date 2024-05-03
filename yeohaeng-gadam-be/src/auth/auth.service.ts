import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import QueryString from 'qs';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { GoogleRequest } from './dto/auth.googleuser.dto';

@Injectable()
export class authService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

    ) { }


    async googleLogin(req) {
        if (!req.user) {
            throw new Error('No user from Google');
        }

        let user = await this.userRepository.findOne({ where: { email: req.user.email } });

        if (!user) {
            user = this.userRepository.create({
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                picture: req.user.picture,
            });
            await this.userRepository.save(user);
        }

        return req.user;

    }
}