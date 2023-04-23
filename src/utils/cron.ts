/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client'
import { CronJob } from 'cron';
const prisma = new PrismaClient()

export async function TickCron() {
    // create a new Date object for the current date and time
    const currentDate = new Date();
    
    // get the UTC offset in milliseconds for the America/Los_Angeles time zone
    const offset = -480; // PST (UTC-8) without DST
    
    // create a new Date object for the America/Los_Angeles time zone
    const localDate = new Date(currentDate.getTime() + offset * 60 * 1000);
    localDate.setUTCHours(0, 0, 0, 0);

    // Tasks that are due in the past
    const tasks = await prisma.task.findMany({where: { dueDate: {lt: localDate}}});

    tasks.forEach(async task => {
        if(task.offsetValue == null || task.offsetValue.toNumber() == 0) {
            console.log("Skipping task due to no offset value");
            return;
        }
        console.log("Adjusting the penalty prize")
        await prisma.task.update({
            where: {id: task.id},
            data: {currentOffset: task.currentOffset.add(task.offsetValue)}
        }) 
    })
    console.log("Done");
}

// new CronJob(
//     '00 00 00 * * *',
//     function() {
//         void main();
//     },
//     null,
//     true,
//     'America/Los_Angeles'
// );

console.log("AM DOWN HERE");