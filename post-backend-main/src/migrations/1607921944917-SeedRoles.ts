import { getRepository, MigrationInterface } from 'typeorm';
import permission from '../seed/permission.seed';
import roleSeed from '../seed/role.seed';
import Permission from '../entity/Permission';
import Role from '../entity/Role';

export default class SeedRoles1607921944917 implements MigrationInterface {

  public async up(): Promise<void> {
    const permissionRepository = getRepository(Permission);
    const roleRepository = getRepository(Role);
    const userPermissions = await permissionRepository.save(
      permission.UserPermissionSeed,
    );
    const adminPermissions = await permissionRepository.save(
      permission.AdminPermissionSeed,
    );
    const userRole = new Role();
    userRole.name = roleSeed.UserRoleSeed.name;
    userRole.description = roleSeed.UserRoleSeed.description;
    userRole.permissions = userPermissions;

    await getRepository('Role').save(userRole);

    const adminRole = new Role();
    adminRole.name = roleSeed.AdminRoleSeed.name;
    adminRole.description = roleSeed.AdminRoleSeed.description;
    adminRole.permissions = adminPermissions;

    await roleRepository.save(adminRole);

  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(): Promise<void> {
  }

}
