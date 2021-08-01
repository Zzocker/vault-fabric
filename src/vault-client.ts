import NodeVault, { client } from 'node-vault';
import { createPublicKey, JwkKeyExportOptions } from 'crypto';

export interface VaultClientOption {
  token: string;
  endpoint: string;
  transitSecretMouthPath: string | '/transit';
  keyName: string;
}

interface IECDSAJWK {
  // hex encoded point on curve
  x: string;
  y: string;
  crv: 'p256' | 'p384';
}

export class VaultClient {
  private readonly backend: client;
  private readonly keyName: string;
  constructor(opt: VaultClientOption) {
    this.backend = NodeVault({
      token: opt.token,
      endpoint: opt.endpoint,
      pathPrefix: opt.transitSecretMouthPath,
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
      return Buffer.from(resp.data.signature, 'base64');
    }
    throw new Error('invalid response data from vault');
  }

  async getPub(): Promise<IECDSAJWK> {
    console.log(`VaultClient::getPub()`);
    const resp = await this.backend.read('keys/' + this.keyName);
    if (resp?.data?.keys && resp?.data?.latest_version) {
      const key = resp.data.keys[resp.data.latest_version];
      let crv: 'p256' | 'p384';
      if (key.name == 'P-256') {
        crv = 'p256';
      } else if (key.name === 'P-384') {
        crv = 'p384';
      } else {
        throw new Error(`EC: ${key.name} not supported`);
      }
      const pem = key.public_key;
      const pub = createPublicKey(pem);
      const exportOpts: JwkKeyExportOptions = { format: 'jwk' };
      const jwk = pub.export(exportOpts);
      return {
        x: Buffer.from(jwk.x, 'base64').toString('hex'),
        y: Buffer.from(jwk.y, 'base64').toString('hex'),
        crv: crv,
      };
    }
    throw new Error('invalid response data from vault');
  }
}
