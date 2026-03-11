import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request){
    try{
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file){
            return NextResponse.json({error: 'No file has been uploaded'},{status: 400});
        }

        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim())
        const dataLines = lines.slice(1);
        let created = 0;
        let errors: string[] = [];

        for(let i = 0; i < dataLines.length; i++){
            try{
                const line = dataLines[i].trim();
                if(!line) continue;
                const values = line.split(',').map(v => v.trim());

                const [firstName1, lastName1, firstName2, lastName2, winner, competitionName, matchDate, ruleset] = values;
                const isNogi = ruleset.toUpperCase() === 'NOGI'; 

                const athlete1 = await prisma.athlete.upsert({
                    where:{ firstName_lastName: {firstName: firstName1, lastName: lastName1}},
                    update: {},
                    create: {firstName: firstName1, lastName: lastName1, gender: 'MALE', belt: 'BLACK', giEloRating: isNogi ? 0 : 1500, noGiEloRating: isNogi ? 1500 : 0}
                });

                const athlete2 = await prisma.athlete.upsert({
                    where:{ firstName_lastName: {firstName: firstName2, lastName: lastName2}},
                    update: {},
                    create: {firstName: firstName2, lastName: lastName2, gender: 'MALE', belt: 'BLACK', giEloRating: isNogi ? 0 : 1500, noGiEloRating: isNogi ? 1500 : 0}
                });

                const competition = await prisma.competition.upsert({
                    where: {name: competitionName},
                    update: {},
                    create: {
                        name: competitionName, startDate: new Date(matchDate), ruleset: ruleset.toUpperCase() == 'NOGI' ? 'NOGI' : 'GI',
                    }
                });

                await prisma.match.create({
                    data: {
                        athlete1Id: athlete1.id,
                        athlete2Id: athlete2.id,
                        competitionId: competition.id,
                        winner: winner == '1' ? 'ATHLETE1' : 'ATHLETE2',
                        matchDate: new Date(matchDate),
                        affectsRatingGi: ruleset.toUpperCase() !== 'NOGI',
                        affectsRatingNoGi: ruleset.toUpperCase() == 'NOGI',
                    }
                });

                created++;
            }catch (err: any){
                errors.push(`Row ${i + 2}: ${err.message}`);
            }
        }

        return NextResponse.json({
           success: true, created, errors: errors.length > 0 ? errors : undefined 
        });
    } catch (error){
        console.error('Import error:', error);
        return NextResponse.json({error: 'Failed to import CSV'}, {status: 500});
    }
}