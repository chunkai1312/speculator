import * as ora from 'ora';

export async function wait(ms: number, spinner?: ora.Ora) {
  if(spinner) spinner.start('正在等待取得資料...');
  await new Promise((resolve) => setTimeout(resolve, ms));
  if(spinner) spinner.stop();
}
