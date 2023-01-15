// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { createEvents, DateArray, EventAttributes } from 'ics';
import { writeFileSync } from 'fs';

type Data = {
    text: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const clipboard = req.body;
    const clipboardLines = clipboard.split('\n');

    if (clipboardLines?.length > 4 && clipboard.search('\t')) {
        let events: EventAttributes[] = [];

        clipboardLines.map((line: string) => {
            let data = line.split('\t');

            if (!data[1]) return;

            let title = data[1].replace(/\(.*?\)/g, '').trim();
            title = `${title.charAt(0).toUpperCase()}${title.slice(1).toLowerCase()}`;
            title = title.replace('Mitteldien', 'Mitteldienst');
            title = title.replace('Normaldien', 'Normaldienst');
            title = title.replace('Dienstr.', 'Dienstreise');
            title = title.replace('kz 11', 'KZ 11');
            let description = data[4];

            let event: EventAttributes = {
                start: [0, 0, 0] as DateArray,
                duration: {
                    hours: 1,
                    minutes: 0,
                },
                title: description ? title + ' - ' + description : title,
                location: 'Langer Grabenweg 45-47, 53175 Bonn',
            };

            event.start = data[0].slice(3).split('.').map(Number).reverse() as DateArray;

            let startTime = data[2];
            let endTime = data[3];

            if (startTime && startTime != '00:00' && endTime != '00:00') {
                event.start = event.start.concat(...startTime.split(':').map(Number)) as DateArray;

                let end = endTime.split(':').map(Number);

                //@ts-ignore
                if (end[0] < event.start[3]) end[0] += 24;

                //@ts-ignore
                let durationInMinutes = end[0] * 60 + end[1] - (event.start[3] * 60 + event.start[4]);

                event.duration = {
                    hours: Math.floor(durationInMinutes / 60),
                    minutes: durationInMinutes % 60,
                };
            }
            //  if ((event.start[1] = 1)) console.log(event);
            events.push(event);
        });

        const { error, value } = createEvents(events);

        writeFileSync(`${__dirname}/../../../static/dienstplan.ics`, value as string);

        if (error) {
            res.status(200).json({ text: error.message });
            return;
        }

        res.status(200).json({ text: 'Success' });
        return;
    }
    res.status(200).json({ text: 'Fail' });
}
