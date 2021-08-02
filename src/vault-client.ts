import NodeVault, { client } from 'node-vault';
import { createPublicKey, JwkKeyExportOptions } from 'crypto';
import jsrsa from 'jsrsasign';

export interface VaultClientOption {
  token: string;
  endpoint: string;
  transitSecretMountPath?: string | '/transit';
  keyName: string;
}


export class VaultClient {
  private readonly backend: client;
  private readonly keyName: string;
  constructor(opt: VaultClientOption) {
    this.backend = NodeVault({
      token: opt.token,
      endpoint: opt.endpoint,
      pathPrefix: opt.transitSecretMountPath,
      apiVersion: 'v1',
    });
    this.keyName = opt.keyName;
  }

  async sign(digest: Buffer, hashed: boolean): Promise<Buffer> {
    console.log(
      `VaultClient::sign() hashed = ${hashed}, digestSize = ${digest.length}`
    );
    const resp = await this.backend.write('sign/' + this.keyName, {
      input: digest.toString('base64'),
      prehashed: hashed,
    });
    if (resp?.data?.signature) {
    const base64Sig = (resp.data.signature as string).split(':')[2];
      return Buffer.from(base64Sig, 'base64');
    }
    throw new Error('invalid response data from vault');
  }

  async getPub(): Promise<jsrsa.KJUR.crypto.ECDSA> {
    console.log(`VaultClient::getPub()`);
    const resp = await this.backend.read('keys/' + this.keyName);
    if (resp?.data?.keys && resp?.data?.latest_version) {
      const key = resp.data.keys[resp.data.latest_version];
      if (key.name == 'P-256') {
      } else if (key.name === 'P-384') {
      } else {
        throw new Error(`EC: ${key.name} not supported`);
      }
      const pem = key.public_key;
      const pub = new jsrsa.KJUR.crypto.ECDSA(pem);
      return pub;
    }
    throw new Error('invalid response data from vault');
  }
}
