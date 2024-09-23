// index.ts
import { ProductJob } from './job';

(async () => {
  const job = new ProductJob();
  const result = await job.execute();
  console.log(result);
})();