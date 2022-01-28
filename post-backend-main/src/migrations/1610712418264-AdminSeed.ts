import { getRepository, MigrationInterface } from 'typeorm';

import adminSeed from '../seed/admin.seed';
import configConstants from '../utils/config';
import User from '../entity/User';
import Wallet from '../entity/Wallet';
import Role from '../entity/Role';

export default class AdminSeed1610712418264 implements MigrationInterface {

  public async up(): Promise<void> {
    const userRepository = getRepository(User);
    const roleRepository = getRepository(Role);

    const roleType = await roleRepository.find({ name: configConstants.SUPER_ADMIN });

    const adminUser = new User();
    adminUser.email = adminSeed.email;
    adminUser.name = adminSeed.name;
    adminUser.username = adminSeed.username;
    adminUser.password = adminSeed.password;
    adminUser.referralCode = adminSeed.referralCode;
    adminUser.roles = roleType;
    adminUser.enabled = true;

    const wallet = new Wallet();
    wallet.user = adminUser;
    wallet.walletBalance = 0;
    wallet.lockedBalance = 0;

    await userRepository.save(adminUser);

  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(): Promise<void> {
  }

}
