import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID:
                process.env.GOOGLE_CLIENT_ID, // CLIENT_ID
            clientSecret: process.env.GOOGLE_SECRET, // CLIENT_SECRET
            callbackURL: process.env.GOOGLE_CALLBACK_URL, // redirect_uri
            passReqToCallback: true,
            scope: ['profile'], // 가져올 정보들
        });
    }

    async validate(
        request: any,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any,
    ) {
        const { name, emails, photos } = profile
        try {
            console.log(profile);

            const jwt = 'placeholderJWT';
            const user = {
                jwt,
                email: emails[0].value,
                firstName: name.familyName,
                lastName: name.givenName,
                picture: photos[0].value,
                accessToken
            };
            done(null, user);
        } catch (err) {
            console.error(err);
            done(err, false);
        }
    }
}