import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from 'typeorm';
import { User } from "./entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {
        // passes two important options
        super({
            secretOrKey: process.env.JWT_SECRET_KEY, //secret text
            // This configures the secret key that JWT strategy will use
            // to decrypt the JWT token in order to validate it
            // and access its payload
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
            // This configures the strategy to look for the JWT
            // in the Authorization Header of the current Request
            // passed over as a Bearer Token
        })
    }

    async validate(payload) {
        const { username } = payload;
        const user: User = await this.userRepository.findOne({ where: { username } });

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}