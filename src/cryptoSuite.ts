import { createHash } from 'crypto';
import {
  ICryptoSuite,
  ICryptoKey,
  KeyOpts,
  ICryptoKeyStore,
} from 'fabric-common';
import { VaultClient } from './vault-client';
import { VaultKey } from './vault-key';
import BN from 'bn.js';
import { ec, curves } from 'elliptic';
const ecsig = require('elliptic/lib/elliptic/ec/signature.js');

const asn1 = require('asn1.js');

const EcdsaDerSig = asn1.define('ECPrivateKey', function () {
  return this.seq().obj(this.key('r').int(), this.key('s').int());
});

export class VaultCryptoSuite implements ICryptoSuite {
  constructor(private readonly vaultClient: VaultClient) {}
  createKeyFromRaw(pem: string): ICryptoKey {
    console.log(
      `VaultCryptoSuite::createKeyFromRaw() pemLength = ${pem.length}`
    );
    return new VaultKey();
  }
  decrypt(key: ICryptoKey, cipherText: Buffer, opts: any): Buffer {
    console.log(`VaultCryptoSuite::decrypt() opts = %o`, opts);
    throw new Error('implement me');
  }
  deriveKey(key: ICryptoKey, opts?: KeyOpts): ICryptoKey {
    console.log(`VaultCryptoSuite::deriveKey() `);
    throw new Error('implement me');
  }
  encrypt(key: ICryptoKey, plainText: Buffer, opts: any): Buffer {
    console.log(`VaultCryptoSuite::encrypt() `);
    throw new Error('implement me');
  }
  getKey(ski: string): Promise<ICryptoKey> {
    console.log(`VaultCryptoSuite::getKey() `);
    throw new Error('implement me');
  }
  getKeySize(): number {
    console.log(`VaultCryptoSuite::getKeySize() `);
    throw new Error('implement me');
  }
  generateKey(opts?: KeyOpts): Promise<ICryptoKey> {
    console.log(`VaultCryptoSuite::generateKey() `);
    throw new Error('implement me');
  }
  hash(msg: string, opts: any): string {
    console.log(`VaultCryptoSuite::hash() opts = %o`, opts);
    return createHash('sha256').update(msg).digest('hex');
  }
  importKey(pem: string, opts?: KeyOpts): ICryptoKey | Promise<ICryptoKey> {
    console.log(`VaultCryptoSuite::importKey() `);
    throw new Error('implement me');
  }
  setCryptoKeyStore(cryptoKeyStore: ICryptoKeyStore): void {
    console.log(`VaultCryptoSuite::setCryptoKeyStore() `);
    throw new Error('implement me');
  }
  async sign(key: ICryptoKey, digest: Buffer): Promise<Buffer> {
    console.log(`VaultCryptoSuite::sign() `);
    const raw = await this.vaultClient.sign(digest, true);
    const rsSig = EcdsaDerSig.decode(raw, 'der');
    const r = rsSig.r as BN;
    let s = rsSig.s as BN;
    console.log(`VaultCryptoSuite::sign()  r = ${r.toString('hex')}`);
    console.log(`VaultCryptoSuite::sign()  s = ${s.toString('hex')}`);
    const halfOrder = ((curves as any).p256.n as BN).shrn(1);
    if (!halfOrder) {
      throw new Error(
        'Can not find the half order needed to calculate "s" value for immalleable signatures. Unsupported curve name: '
      );
    }
    if (s.cmp(halfOrder) === 1) {
      const bigNum = (curves as any).p256.n as BN;
      s = bigNum.sub(s);
    }
    const der = (new ecsig({r:r,s:s})).toDER()
    console.log(`VaultCryptoSuite::sign() der = ${der}`)
    return Buffer.from(der);
  }
  verify(key: ICryptoKey, signature: Buffer, digest: Buffer): boolean {
    console.log(`VaultCryptoSuite::verify() `);
    throw new Error('implement me');
  }
}
