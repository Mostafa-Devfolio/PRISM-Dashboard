"use server"
import { cookies } from "next/headers";

export async function saveLogin(myToken: string) {
    const cookieStore = await cookies();
    const token = cookieStore.set('AuthToken', myToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/'
    })
}

export async function getLogin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('AuthToken');
    console.log(token);
    return token?.value;
}

export async function deleteLogin() {
    const cookieStore = await cookies();
    const token = cookieStore.delete('AuthToken');
    return token;
}