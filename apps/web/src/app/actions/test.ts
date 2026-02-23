'use server'

import { revalidateTag } from "next/cache"

export async function test() {
  revalidateTag('perfil-usuario', 'layout');
  return {success: true}
}
