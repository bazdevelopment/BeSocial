import Queue, { Job } from 'bull';
import { BullAdapter } from '@bull-board/api/bullAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { IAuthJob } from '@src/features/auth/interfaces/auth.interface';
import { IEmailJob, IUserJob, IUserJobInfo } from '@src/features/user/interfaces/user.interface';
import { IPostJobData } from '@src/features/post/interfaces/post.interface';
import { IReactionJob } from '@src/features/reaction/interfaces/reaction.interface';
import { ICommentJob } from '@src/features/comment/interfaces/comment.interface';
import { IBlockedUserJobData, IFollowerJobData } from '@src/features/follower/interface/follower.interface';
import { INotificationJobData } from '@src/features/notification/interfaces/notification.interface';
import { IFileImageJobData } from '@src/features/image/interfaces/image.interface';
import { IChatJobData, IMessageData } from '@src/features/chat/interfaces/chat.interface';

type IBaseJobData =
  | IAuthJob
  | IUserJob
  | IEmailJob
  | IPostJobData
  | IReactionJob
  | ICommentJob
  | IFollowerJobData
  | IBlockedUserJobData
  | INotificationJobData
  | IFileImageJobData
  | IChatJobData
  | IMessageData
  | IUserJobInfo;
/**
 * Function used for setting up a bull job queue
 * @param queueName
 */

/* create  a new Express server adapter instance  */
export const serverAdapter: ExpressAdapter = new ExpressAdapter();

export const createBaseQueue = (
  queueName: string
): {
  addJobToQueue: (jobName: string, data: IBaseJobData) => void;
  processJob: (jobName: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>) => void;
} => {
  /* initialize an empty array that will hold bull adapters for each queue. */
  let bullAdapters: BullAdapter[] = [];
  /* create a new Bull queue instance  */
  const queue: Queue.Queue = new Queue(queueName, `${process.env.REDIS_HOST}`);
  /* merge new bull adapter into bull adapters array  */
  bullAdapters = [...bullAdapters, new BullAdapter(queue)];
  /* remove duplicate bull adapters */
  const uniqueBullAdapters = [...new Set(bullAdapters)];
  /* set the base path for the server adapter to /queues. */
  serverAdapter.setBasePath('/queues');
  /* create a new Bull Board instance with the uniqueBullAdapters array and the serverAdapter instance. */
  createBullBoard({
    queues: uniqueBullAdapters,
    serverAdapter
  });
  /* message indicating that the queue has been created. */
  console.log(`${queueName} queue has been created ✅`);
  /* listen for the 'completed' event on the queue instance and removes the job from the queue when it is completed. */
  queue.on('completed', (job: Job) => {
    job.remove();
  });
  /* listen for the 'global:completed' event on the queue instance and logs a message to the console when a job is completed. */
  queue.on('global:completed', (jobId: string) => {
    console.log(`Job ${jobId} completed ✅`);
  });
  /* listens for the 'global:stalled' event on the queue and logs a message then the job is stalled */
  queue.on('global:stalled', (jobId: string) => {
    console.log(`Job ${jobId} stalled ⚠️`);
  });

  /* add the job to the queue and try 3 times if the process failed, and add a delay of 5 seconds between each attempt */
  const addJobToQueue = (jobName: string, data: IBaseJobData): void => {
    queue.add(jobName, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  };

  /* concurrency:number - how many jobs to be processed at a given time. -> e.g.concurrency = 5,  if there are 20 jobs in the queue, first 5 jobs will be processed
    then, next 5 jobs will be processed
 */
  const processJob = (jobName: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void => {
    queue.process(jobName, concurrency, callback);
  };

  return { addJobToQueue, processJob };
};
