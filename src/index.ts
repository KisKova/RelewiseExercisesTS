import { GoogleShoppingProductJob, RawProductDataJob } from './jobs';
import { JsonProductJob } from './jobs';

(async () => {
  const job = new JsonProductJob();
  const result = await job.execute();
  console.log(result);
})();

(async () => {
  const job = new GoogleShoppingProductJob();
  const result = await job.execute();
  console.log(result);
})();

(async () => {
  const job = new RawProductDataJob();
  const result = await job.execute();
  console.log(result);
})();