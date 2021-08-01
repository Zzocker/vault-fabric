import NodeVault from 'node-vault';
import { VaultClient, VaultClientOption } from '../src/vault-client';
import { assert } from 'chai';

describe('vault-client.ts', () => {
  const opts: VaultClientOption = {
    endpoint: 'http://localhost:8200',
    token: 'tokenId',
    transitSecretMouthPath: '/transit',
    keyName: 'admin',
  };
  before(async () => {
    const vault = NodeVault({
      endpoint: opts.endpoint,
      token: opts.token,
      pathPrefix: opts.transitSecretMouthPath,
      apiVersion: 'v1',
    });
    try {
      await vault.write('keys/' + opts.keyName, {
        type: 'ecdsa-p256',
      });
    } catch (error) {
      console.log(error);
    }
  });

  it('sign()', async () => {
    const client = new VaultClient(opts);
    const signature = await client.sign(Buffer.from('Hello'), false);
    assert.isNotEmpty(signature);
  });
  it('sign()::fail-keyNotFound', async () => {
    const client = new VaultClient({
      endpoint: opts.endpoint,
      token: opts.token,
      transitSecretMouthPath: opts.transitSecretMouthPath,
      keyName: 'not-found',
    });
    let signature: Buffer;
    let err: Error;
    try {
      signature = await client.sign(Buffer.from('Hello'), false);
    } catch (error) {
      err = error;
    }
    assert.isUndefined(signature);
    assert.isNotEmpty(err);
  });
  it('getPub()', async () => {
    const client = new VaultClient(opts);
    const jwk = await client.getPub();
    assert.equal(jwk.crv, 'p256');
    const re = /[0-9A-Fa-f]{6}/g;
    assert.isTrue(re.test(jwk.x));
    assert.isTrue(re.test(jwk.y));
  });
});
