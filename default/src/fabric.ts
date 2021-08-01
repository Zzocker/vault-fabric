import { Gateway, GatewayOptions, Wallets } from 'fabric-network';
import { config } from './config';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';

async function getGateway(id: string): Promise<Gateway> {
  const wallet = await Wallets.newFileSystemWallet(config.walletPath);
  if ((await wallet.get(id)) === undefined) {
    throw new Error(`${id} not found , register it first`);
  }
  const option: GatewayOptions = {
    identity: id,
    wallet: wallet,
  };

  const ccp = (await load(readFileSync(config.ccpPath, 'utf-8'))) as object;
  console.log(ccp);

  const gateway = new Gateway();
  await gateway.connect(ccp, option);
  return gateway;
}

export async function query(id: string, assetId?: string) {
  const gateway = await getGateway(id);
  const network = await gateway.getNetwork(config.channelId);
  const contract = network.getContract(config.ccName);
  if (assetId) {
    console.log(`[QUERY] get asset with id = ${assetId}`);
    const resp = await contract.evaluateTransaction('ReadAsset', assetId);
    console.log('[QUERY] asset = %o', JSON.parse(resp.toString('utf-8')));
  } else {
    console.log(`[QUERY] get all asset`);
    const resp = await contract.evaluateTransaction('GetAllAssets');
    console.log('[QUERY] assets = %o', JSON.parse(resp.toString('utf-8')));
  }
  gateway.disconnect();
}

export async function invoke(
  userId: string,
  assetId: string,
  newOwner: string
) {
  const gateway = await getGateway(userId);
  const network = await gateway.getNetwork(config.channelId);
  const contract = network.getContract(config.ccName);
  await contract.submitTransaction('TransferAsset', assetId, newOwner);
  console.log(`[INVOKE] : ${assetId} transferred to ${newOwner}`);
  gateway.disconnect()
}
