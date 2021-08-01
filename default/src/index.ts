import { register } from './ca';
import { invoke, query } from './fabric';

let params = process.argv.splice(2);

if (params.length < 1) {
  console.log('require at least one argument');
  console.log(`\t\tregister [userId]`);
  console.log(`\t\tquery [userId] [assetId?]`);
  console.log(`\t\tinvoke [userId] [assetId] [newOwner]`);
  process.exit(1);
}
console.log('='.repeat(50));
console.log('DEFAULT SAMPLE');
console.log('='.repeat(50));

const cmd = params[0];
console.log(`command = ${cmd}`);

(async () => {
  switch (cmd) {
    case 'register':
      params = params.splice(1);
      if (params.length !== 1) {
        console.log('[register] require one argument , (id)');
        process.exit(1);
      }
      await register(params[0]);
      break;
    case 'query':
      params = params.slice(1);
      if (params.length < 1) {
        console.log(
          '[query] require at least one argument , (userId,assetId?)'
        );
        process.exit(1);
      }
      if (params.length == 2) {
        await query(params[0], params[1]);
      } else {
        await query(params[0]);
      }
      break;
    case 'invoke':
      params = params.splice(1);
      if (params.length !== 3) {
        console.log(
          '[invoke] require at three argument , (userId,assetId,newOwner)'
        );
        process.exit(1);
      }
      await invoke(params[0], params[1], params[2]);
      break;
    default:
      console.log(`command ${cmd} not supported`);
      console.log(`\t\tregister [userId]`);
      console.log(`\t\tquery [userId] [assetId?]`);
      console.log(`\t\tinvoke [userId] [assetId] [newOwner]`);
      process.exit(1);
  }
})();
