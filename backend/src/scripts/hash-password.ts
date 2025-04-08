import * as bcrypt from 'bcrypt'

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 3)
}

const password = process.argv[2]
if (!password) {
  console.error('Please provide a password as an argument')
  process.exit(1)
}

hashPassword(password)
  .then((hashedPassword) => {
    console.log('Hashed password:', hashedPassword)
  })
  .catch((error) => {
    console.error('Error hashing password:', error)
  }) 