import { Identity, IdentityData, IdentityProvider } from 'fabric-network';
import { ICryptoSuite, User } from 'fabric-common';
import { VaultClient } from './vault-client';
import { VaultCryptoSuite } from './cryptoSuite';
import { VaultKey } from './vault-key';

export interface VaultX509Identity extends Identity {
  type: 'Vault-X.509';
  credentials: {
    certificate: string;
  };
}

interface VaultX509IdentityDataV1 extends IdentityData {
  type: 'Vault-X.509';
  version: 1;
  credentials: {
    certificate: string;
  };
  mspId: string;
}

export interface VaultTransitOptions {
  token: string;
  endpoint: string;
  transitSecretMountPath?: string | '/transit';
  keyName: string;
}

export class VaultX509Provider implements IdentityProvider {
  readonly type: string = 'Vault-X.509';
  private readonly cryptoSuite: VaultCryptoSuite;
  private readonly vaultClient: VaultClient;
  constructor(opt: VaultTransitOptions) {
    this.vaultClient = new VaultClient({
      token: opt.token,
      endpoint: opt.endpoint,
      keyName: opt.keyName,
      transitSecretMountPath: opt.transitSecretMountPath,
    });
    this.cryptoSuite = new VaultCryptoSuite(this.vaultClient);
  }
  getCryptoSuite(): ICryptoSuite {
    console.log(`VaultX509Provider::getCryptoSuite()`);
    throw new Error('implement me!!');
  }
  fromJson(data: IdentityData): VaultX509Identity {
    console.log(`VaultX509Provider::fromJson() data = %o`, data);
    throw new Error('implement me!!');
  }
  toJson(identity: VaultX509Identity): IdentityData {
    console.log(`VaultX509Provider::toJson()`);
    throw new Error('implement me!!');
  }
  async getUserContext(identity: VaultX509Identity, name: string): Promise<User> {
    console.log(
      `VaultX509Provider::getUserContext() name = ${name} , identity = %o`,
      identity
    );
    if (!identity) {
      throw Error('Vault X.509 identity is missing');
    } else if (!identity.credentials) {
      throw Error('Vault X.509 identity is missing the credential data.');
    }
    const user = new User(name)
    user.setCryptoSuite(this.cryptoSuite)

    await user.setEnrollment(new VaultKey(),identity.credentials.certificate,identity.mspId)
    
    return user
  }
}
