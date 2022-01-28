import { EntityRepository, Repository } from 'typeorm';

import Permission from 'entity/Permission';

@EntityRepository(Permission)
export default class PermissionRepository extends Repository<Permission> {

}
