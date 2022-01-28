import { EntityRepository, Repository } from 'typeorm';

import Wallet from 'entity/Wallet';

@EntityRepository(Wallet)
export default class WalletRepository extends Repository<Wallet> {

}
