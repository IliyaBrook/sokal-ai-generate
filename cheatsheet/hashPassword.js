import * as bcrypt from 'bcrypt'

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 3)
}

const password = "123456"
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