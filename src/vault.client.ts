import NodeVault, { client } from 'node-vault';
import { JsonWebKey, createPublicKey, JwkKeyExportOptions } from 'crypto';
export interface IVaultClientOptions {
  endpoint: string;
  token: string;
}
export enum VaultKeyECCurve {
  P256 = 'ecdsa-p256',
  P384 = 'ecdsa-p384',
}

export interface ECJsonWebKey {
  crv: VaultKeyECCurve;
  // hex encoded x and y point on ec
  x: string;
  y: string;
  // latest version of key used
  version: string;
}
export class VaultClient {
  private readonly backend: client;
  constructor(opts: IVaultClientOptions) {
    this.backend = NodeVault({
      endpoint: opts.endpoint,
      token: opts.token,
      apiVersion: 'v1',
      pathPrefix: '/transit',
    });
  }

  /**
   * @param keyName for sign
   * @param data , payload that need to signed
   * @param hashed , whether data is already hashed
   */
  async sign(keyName: string, data: Buffer, hashed: boolean): Promise<Buffer> {
    const res = await this.backend.write('sign/' + keyName, {
      input: data.toString('base64'),
      prehashed: hashed,
    });
    if (res?.data?.signature) {
      const sigData = (res.data.signature as string).split(':');
      return Buffer.from(sigData[2], 'base64');
    }
    throw new Error('invalid vault response');
  }

  /**
   *
   * @param keyName of signing key
   * @param data
   * @param signature
   * @param hashed : whether data is already hashed
   */
  async verify(
    keyName: string,
    data: Buffer,
    signature: Buffer,
    hashed: boolean
  ): Promise<boolean> {
    const { version } = await this.pubKey(keyName);
    const res = await this.backend.write('verify/' + keyName, {
      input: data.toString('base64'),
      signature: `vault:${version}:${signature.toString('base64')}`,
      prehashed: hashed,
    });
    if (res?.data?.valid !== null) {
      return res.data.valid as boolean;
    }
    throw new Error('invalid vault response');
  }

  /**
   *
   * @param keyName of the key
   */
  async pubKey(keyName: string): Promise<ECJsonWebKey> {
    const res = await this.backend.read('keys/' + keyName);
    if (res?.data?.latest_version) {
      const version: string = res.data.latest_version;
      const pem = res.data.keys[version].public_key;
      const keyExportOpts: JwkKeyExportOptions = {
        format: 'jwk',
      };
      const pub = createPublicKey(pem);
      const jwk = pub.export(keyExportOpts);
      let crv: VaultKeyECCurve;
      switch (jwk.crv) {
        case 'P-256':
          crv = VaultKeyECCurve.P256;
          break;
        case 'P-384':
          crv = VaultKeyECCurve.P384;
          break;
        default:
          throw new Error('invalid key type');
      }
      return {
        crv: crv,
        x: Buffer.from(jwk.x, 'base64').toString('hex'),
        y: Buffer.from(jwk.y, 'base64').toString('hex'),
        version: 'v' + version,
      };
    }
    throw new Error('invalid response from vault');
  }

  /**
   *
   * @param keyName of the key
   * @param kType type of the key ecdsa-p256 | ecdsa-p384
   */
  async newKey(keyName: string, kType: VaultKeyECCurve) {
    const response = await this.backend.write('keys/' + keyName, {
      type: kType,
    });
  }
}
