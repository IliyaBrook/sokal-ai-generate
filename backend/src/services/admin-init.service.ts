import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'

import { UserService } from './user.service'
import type { EnvironmentVariables } from '@/types'
import type { ISignUpData } from '@sokal_ai_generate/shared-types'

@Injectable()
export class AdminInitService implements OnModuleInit {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const adminUser = await this.userService.findOne({
        role: 'admin',
      })

      if (!adminUser) {
        console.log('No admin user found. Creating admin user...')

        const email = this.configService.get<
          EnvironmentVariables['ADMIN_USER_EMAIL']
        >('ADMIN_USER_EMAIL')
        const password = this.configService.get<
          EnvironmentVariables['ADMIN_USER_PASSWORD']
        >('ADMIN_USER_PASSWORD')
        const firstname = this.configService.get<
          EnvironmentVariables['ADMIN_USER_FIRST_NAME']
        >('ADMIN_USER_FIRST_NAME')
        const lastname = this.configService.get<
          EnvironmentVariables['ADMIN_USER_LAST_NAME']
        >('ADMIN_USER_LAST_NAME')

        if (!email || !password || !firstname || !lastname) {
          console.error(
            'Admin user environment variables are not set properly. Skipping admin user creation.',
          )
          return
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 3)

        // Create admin user
        await this.userService.createUser({
          email,
          password: hashPassword,
          firstname,
          lastname,
          role: 'admin',
        } as ISignUpData & { role: string })

        console.log('Admin user created successfully.')
      } else {
        console.log('Admin user already exists.')
      }
    } catch (error) {
      console.error('Error initializing admin user:', error)
    }
  }
}
