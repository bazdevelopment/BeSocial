import { createBaseQueue } from './base.queue';
import { ReactionWorker } from 'shared/workers/reaction.worker';
import { IReactionJob } from 'features/reaction/interfaces/reaction.interface';

/**
 * Reaction queue
 */
export const ReactionQueue = () => {
  const { addJobToQueue, processJob } = createBaseQueue('REACTION');

  processJob('addReactionToDb', 5, ReactionWorker.addReactionToDB);
  processJob('removeReactionFromDB', 5, ReactionWorker.removeReactionFromDB);

  /**
   * Function used to add the reaction job into the queue
   */
  const addReactionJob = (jobName: string, data: IReactionJob): void => {
    addJobToQueue(jobName, data);
  };
  return { addReactionJob };
};
