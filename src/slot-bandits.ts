import { spawn } from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { Connection } from '@solana/web3.js';

// types for yargs
interface Argv {
  validator: string;
  epoch: number;
  slotDepth: number;
}

// group slots into ranges with an optional maximum gap between slots

function groupSlotsIntoRanges(slots: number[], maxGap: number = 0): Array<{ startSlot: number; endSlot: number }> {
  // sort the slots in asc
  slots.sort((a, b) => a - b);

  const ranges: Array<{ startSlot: number; endSlot: number }> = [];
  let startSlot = slots[0];
  let endSlot = slots[0];

  for (let i = 1; i < slots.length; i++) {
    const slot = slots[i];
    if (slot <= endSlot + maxGap + 1) {
      // slot is within the maximum allowed gap
      endSlot = slot;
    } else {
      // save the previous range and start a new one
      ranges.push({ startSlot, endSlot });
      startSlot = slot;
      endSlot = slot;
    }
  }

  // final range
  ranges.push({ startSlot, endSlot });

  return ranges;
}

// testing

const slots = [
  292471736, 292471737, 292471738, 292471739, 292505864, 292505865,
  292505866, 292505867, 292523656, 292523657, 292523658, 292523659,
  292532044, 292532045, 292532046, 292532047, 292543324, 292543325,
  292543326, 292543327, 292548028, 292548029, 292548030, 292548031,
  293867638,293867639,293867640,293867641,293867642,293867643,293867644,293867645,293867646,293867647,293867648,293867649,293867650,293867651,293867652,293867653,293867654,293867655,293867656,293867657,293867658,293867659,293867660,293867661,293867662,293867663,293867664,293867665,293867666,293867667,293867668,293867669,293867670,293867671,293867672,293867673,293867674,293867675,293867676,293867677,293867678,293867679,293867680,293867681,293867682,293867683,293867684,293867685,293867686,293867687,293867688,293867689,293867690,293867691,293867692,293867693,293867694,293867695,293867696,293867697,293867698,293867699,293867700,293867701,293867702,293867703,293867704,293867705,293867706,293867707,293867708,293867709,293867710,293867711,293867712,293867713,293867714,293867715,293867716,293867717,293867718,293867719,293867720,293867721,293867722,293867723,293867724,293867725,293867726,293867727,293867728,293867729,293867730,293867731,293867732,293867733,293867734,293867735,293867736,293867737,293867738,293867739,293867740,293867741,293867742,293867743,293867744,293867745,293867746,293867747,293867748,293867749,293867750,293867751,293867752,293867753,293867754,293867755,293867756,293867757,293867758,293867759,293867760,293867761,293867762,293867763,293867764,293867765,293867766,293867767,293867768,293867769,293867770,293867771,293867772,293867773,293867774,293867775,293867776,293867777,293867778,293867779,293867780,
  293863969,293863970,293863971,293863972,293863973,293863974,293863975,293863976,293863977,293863978,293863979,293863980,293863981,293863982,293863983,293863984,293863985,293863986,293863987,293863988,293863989,293863990,293863991,293863992,293863993,293863994,293863995,293863996,293863997,293863998,293863999,293864000,293864001,293864002,293864003,293864004,293864005,293864006,293864007,293864008,293864009,293864010,293864011,293864012,293864013,293864014,293864015,293864016,293864017,293864018,293864019,293864020,293864021,293864022,293864023,293864024,293864025,293864026,293864027,293864028,293864029,293864030,293864031,293864032,293864033,293864034,293864035,293864036,293864037,293864038,293864039,293864040,293864041,293864042,293864043,293864044,293864045,293864046,293864047,293864048,293864049,293864050,293864051,293864052,293864053,293864054,293864055,293864056,293864057,293864058,293864059,293864060,293864061,293864062,293864063,293864064,293864065,293864066,293864067,293864068,293864069,293864070,293864071,293864072,293864073,293864074,293864075,293864076,293864077,293864078,293864079,293864080,293864081,293864082,293864083,293864088,293864089,293864090,293864091,293864092,293864093,293864094,293864095,293864096,293864097,293864098,293864099,293864100,293864101,293864102,293864103,293864104,293864105,293864106,293864107,293864108,293864109,293864110,293864111,293864112,293864113,293864114,293864115,293864116,293864117,293864118,293864119,293864120,293864121,293864122,293864123,293864124,293864125,293864126,293864127,293864128,293864129,293864130,293864131,293864132,293864133,293864134,293864135,293864136,293864137,293864138,293864139,293864140,293864141,293864142,293864143,293864144,293864145,293864146,293864147,293864148,293864149,293864150,293864151,293864152,293864153,293864154,293864155,293864156,293864157,293864158,293864159,293864160,293864161,293864162,293864163,293864164,293864165,293864166,293864167,293864168,293864169,293864170,293864171,293864172,293864173,293864174,293864175,
];



// maximum gap between slots (e.g., 0 for contiguous slots)
const maxGap = 0;

// get the ranges
const ranges = groupSlotsIntoRanges(slots, maxGap);

// for each range call getBlocks(startSlot, endSlot)
for (const range of ranges) {
  const { startSlot, endSlot } = range;
  // call getBlocks(startSlot, endSlot)
  // await connection.getBlocks(startSlot, endSlot);
  console.log(`fetching blocks from ${startSlot} to ${endSlot}`);
}



const connection = new Connection('https://api.mainnet-beta.solana.com');

// save to json, bc of buffer overflow issues
const leaderScheduleFile = join(__dirname, 'leader-schedule.json');
const validatorsFile = join(__dirname, 'validators.json');

// batch count for getBlocks
const BATCH_COUNT = 20;

// max attempts for refetching blocks
const MAX_RETRIES = 5;

const argv = yargs(hideBin(process.argv))
  .option('validator', {
    alias: 'v',
    type: 'string',
    demandOption: true,
    description: 'validator identity pubkey',
  })
  .option('epoch', {
    alias: 'e',
    type: 'number',
    demandOption: true,
    description: 'epoch number',
  })
  .option('slotDepth', {
    alias: 's',
    type: 'number',
    default: 4,
    description: 'how deep to go with the slots (up or down from the validators slots) WIP',
  })
  .help()
  .alias('help', 'h').argv as Argv;

// running cli using spawn
function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';

    // take data from stdout
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // take error messages from stderr
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // handle the child process exit
    child.on('close', (code) => {
      if (code !== 0) {
        reject(`cmd failed with exit code ${code}: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

// save to json
function saveToFile(filePath: string, data: any) {
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`data saved to ${filePath}`);
}

// leader schedule using the vli and save it to a file
async function fetchLeaderSchedule(epoch: number): Promise<any> {
  console.log(`fetching leader schedule for epoch ${epoch}...`);
  const args = ['leader-schedule', '--output', 'json', '--epoch', epoch.toString()];
  const output = await runCommand('solana', args);
  const parsedOutput = JSON.parse(output);
  saveToFile(leaderScheduleFile, parsedOutput);
  return parsedOutput;
}

// validator information using the cli and save it to a file
async function fetchValidatorsInfo(): Promise<any> {
  console.log('fetching validator information...');
  const args = ['validators', '--output', 'json'];
  const output = await runCommand('solana', args);
  const parsedOutput = JSON.parse(output);
  saveToFile(validatorsFile, parsedOutput);
  return parsedOutput;
}

// sleep to add delay between batch requests
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// fetch blocks with retry logic and save to batch file
async function fetchBlocksWithRetry(batchStart: number, batchEnd: number, batchIndex: number, epoch: number, attempt = 1): Promise<number[]> {
  const batchFilePath = join(__dirname, `blocks_batch_${batchIndex}.json`);
  try {
    const blocks = await connection.getBlocks(batchStart, batchEnd);
    saveToFile(batchFilePath, blocks);  // save each batch
    return blocks;
  } catch (error) {
    console.error(`error fetching blocks for slots ${batchStart} to ${batchEnd}: ${(error as any).message}`);
    if (attempt < MAX_RETRIES) {
      const delay = 2000 * attempt; // solana dont like spamming. increase every time we are jailed.
      console.log(`retrying... attempt ${attempt} of ${MAX_RETRIES}. waiting ${delay / 1000} seconds.`);
      await sleep(delay);
      return fetchBlocksWithRetry(batchStart, batchEnd, batchIndex, epoch, attempt + 1); // recursive retry
    } else {
      console.error(`max retries reached for slots ${batchStart} to ${batchEnd}. skipping this range.`);
      return [];
    }
  }
}

// merge batch files into the final file
function mergeBatchFiles(epoch: number) {
  const finalFilePath = join(__dirname, `blocks_epoch_${epoch}.json`);
  const mergedData: number[] = [];

  for (let i = 0; i < BATCH_COUNT; i++) {
    const batchFilePath = join(__dirname, `blocks_batch_${i}.json`);
    if (existsSync(batchFilePath)) {
      const batchData = JSON.parse(readFileSync(batchFilePath, 'utf-8'));
       // merge batch data
      mergedData.push(...batchData);
       // remove after merging
      unlinkSync(batchFilePath);
    }
  }
  // save the merged data to the final file
  saveToFile(finalFilePath, mergedData);
}

// divide the slot range into batches and check skipped slots
async function checkSkippedSlotsInBatches(validatorSlots: number[], startSlot: number, endSlot: number, epoch: number) {
  console.log('checking for skipped slots...');
  const skippedSlots: number[] = [];

  const totalSlots = endSlot - startSlot + 1;
   // divide into batches
  const batchSize = Math.floor(totalSlots / BATCH_COUNT);

  for (let i = 0; i < BATCH_COUNT; i++) {
    const batchStart = startSlot + i * batchSize;
     // handle last batch
    const batchEnd = i === BATCH_COUNT - 1 ? endSlot : batchStart + batchSize - 1;

    console.log(`fetching blocks for batch ${i + 1}: slots ${batchStart} to ${batchEnd}`);

    const confirmedBlocks = await fetchBlocksWithRetry(batchStart, batchEnd, i, epoch);
    const confirmedSet = new Set(confirmedBlocks);

    //  find the bandits
    for (const slot of validatorSlots) {
      if (slot >= batchStart && slot <= batchEnd && !confirmedSet.has(slot)) {
        skippedSlots.push(slot);
      }
    }

    // delay to avoid rate limiting in ms
    await sleep(500);
  }

  if (skippedSlots.length > 0) {
    console.log('skipped slots:', skippedSlots);
  } else {
    console.log('no slots were skipped. good work.');
  }

  // merge the files
  mergeBatchFiles(epoch);

  return skippedSlots;
}

// process the leader schedule and validator information
async function processValidatorSlots() {
  const validatorId = argv.validator;
  const epoch = argv.epoch;
  const slotDepth = argv.slotDepth;

  // always fetch fresh data and overwrite the files
  let leaderSchedule = await fetchLeaderSchedule(epoch);
  let validatorsInfo = await fetchValidatorsInfo();

  // find the slots assigned to the given validator
  const validatorSlots = leaderSchedule.leaderScheduleEntries
    .filter((entry: any) => entry.leader === validatorId)
    .map((entry: any) => entry.slot);

  if (validatorSlots.length === 0) {
    console.error(`no slots found for validator ${validatorId} in the leader schedule.`);
    return;
  }

  console.log(`validator ${validatorId} is scheduled for slots:`, validatorSlots);

  // get the start and end slot from the validators assigned slots
  const startSlot = Math.min(...validatorSlots);
  const endSlot = Math.max(...validatorSlots);

  // check for skipped slots in batches and save block data
  const skippedSlots = await checkSkippedSlotsInBatches(validatorSlots, startSlot, endSlot, epoch);

  if (skippedSlots.length === 0) {
    return; // exit if no slots
  }

  
  // for each skipped slot, find the neighbors and check if they are bandits and skipped their slots
  for (const currentSlot of skippedSlots) {
    console.log(`\nskipped slot: ${currentSlot}`);

    // get the neighboring slots
    const previousSlot = currentSlot - slotDepth;
    const nextSlot = currentSlot + slotDepth;

    // find validators before and after in the slot schedule
    const prevValidatorEntry = leaderSchedule.leaderScheduleEntries.find(
      (entry: any) => entry.slot === previousSlot
    );
    const nextValidatorEntry = leaderSchedule.leaderScheduleEntries.find(
      (entry: any) => entry.slot === nextSlot
    );

    // find validator information from fetched validator data
    function getValidatorInfo(identity: string) {
      return validatorsInfo.validators.find((v: any) => v.identityPubkey === identity);
    }

    // check if previous validator skipped their slot
    if (prevValidatorEntry) {
      const prevValidatorInfo = getValidatorInfo(prevValidatorEntry.leader);
      //const prevSlotSkipped = !(await fetchBlocksWithRetry(previousSlot, previousSlot)).includes(previousSlot);
      const prevSlotSkipped = !(await fetchBlocksWithRetry(previousSlot, previousSlot, -1, epoch)).includes(previousSlot);
      console.log(`validator before slot ${currentSlot}:`);
      if (prevValidatorInfo) {
        console.log(JSON.stringify(prevValidatorInfo, null, 2));
      } else {
        console.log(`- validator ${prevValidatorEntry.leader} (no info)`);
      }

      if (prevSlotSkipped) {
        console.log(`- validator ${prevValidatorEntry.leader} skipped slot ${previousSlot}.`);
      } else {
        console.log(`- validator ${prevValidatorEntry.leader} confirmed slot ${previousSlot}.`);
      }
    } else {
      console.log(`no validator found before slot ${currentSlot}.`);
    }

    // check if next validator skipped their slot
    if (nextValidatorEntry) {
      const nextValidatorInfo = getValidatorInfo(nextValidatorEntry.leader);
      //const nextSlotSkipped = !(await fetchBlocksWithRetry(nextSlot, nextSlot)).includes(nextSlot);
      const nextSlotSkipped = !(await fetchBlocksWithRetry(nextSlot, nextSlot, -1, epoch)).includes(nextSlot);

      console.log(`validator after slot ${currentSlot}:`);
      if (nextValidatorInfo) {
        console.log(JSON.stringify(nextValidatorInfo, null, 2));
      } else {
        console.log(`- validator ${nextValidatorEntry.leader} (no info found)`);
      }

      if (nextSlotSkipped) {
        console.log(`- validator ${nextValidatorEntry.leader} skipped slot ${nextSlot}.`);
      } else {
        console.log(`- validator ${nextValidatorEntry.leader} confirmed slot ${nextSlot}.`);
      }
    } else {
      console.log(`no validator found after slot ${currentSlot}.`);
    }
  }
}

// run it
processValidatorSlots().catch(console.error);

