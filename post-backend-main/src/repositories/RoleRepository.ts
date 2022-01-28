import { EntityRepository, Repository } from 'typeorm';

import Role from 'entity/Role';

@EntityRepository(Role)
export default class RoleRepository extends Repository<Role> {

}
