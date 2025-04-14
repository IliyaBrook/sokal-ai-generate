import * as bcrypt from 'bcrypt'

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 3)
}

const password = process.argv[2]
if (!password) {
  process.exit(1)
}

hashPassword(password)
  .catch((error) => {
    console.error('Error hashing password:', error)
  }) 