import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function getArg(name) {
  const full = process.argv.find((arg) => arg.startsWith(`--${name}=`))
  if (!full) return null
  return full.replace(`--${name}=`, '').trim()
}

async function main() {
  const name = getArg('name')
  const username = getArg('username')?.toLowerCase()
  const email = getArg('email')?.toLowerCase() ?? null
  const phone = getArg('phone')?.toLowerCase() ?? null
  const password = getArg('password')

  if (!name || !username || !password) {
    throw new Error(
      'Uso: node scripts/create-admin.mjs --name="Admin" --username="admin" --password="senha123" [--email="admin@site.com"] [--phone="5511999999999"]'
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name,
      username,
      email,
      phone,
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log('Administrador criado com sucesso.')
}

main()
  .catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
