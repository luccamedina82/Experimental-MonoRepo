import {jwtVerify} from 'jose'

const JWT_SECRET = process.env.JWT_SECRET
const encodedToken = new TextEncoder().encode(JWT_SECRET)

export async function verifyTokenWithJose(token: string) {
    try {
        const { payload } = await jwtVerify(token, encodedToken)
        return {
            isValid: true,
            payload,
        }
    } catch (error) {
        console.error('Token invalido o expirado')
        return {
            isValid: false,
            payload: null,
        }
    }

}