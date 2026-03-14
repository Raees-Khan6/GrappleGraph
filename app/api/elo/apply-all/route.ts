import {NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';
import { applyElo } from '@/app/lib/elo';

const prisma = new PrismaClient();

export async function POST(request: Request){
    try{
        console.log('ELO processing starting');
        const matches = await prisma.match.findMany({
            include:{
                athlete1: true,
                athlete2: true,
                competition: true
            },
            orderBy:{
                competition: {startDate: 'asc'}
            }
        });

        console.log(`Matches to process: ${matches.length}`);
        let matchCountProc = 0;
        let errCount = 0;
        const errors: string[] = [];

        for(const match of matches){
            try{
                const isNoGi = match.affectsRatingNoGi;
                const isGi = match.affectsRatingGi;
                if(!isNoGi && !isGi){
                    console.log(`no ruleset, match -> ${match.id} skipped`);
                    continue;
                }

                const athlete1 = await prisma.athlete.findUnique({
                    where:{id:match.athlete1Id}
                });

                const athlete2 = await prisma.athlete.findUnique({
                    where:{id:match.athlete2Id}
                });

                if(!athlete1 || !athlete2){
                    errors.push(`Athletes not found: Match ${match.id}`);
                    errCount++;
                    continue;
                }

                const athlete1CurrRating = isNoGi ? athlete1.noGiEloRating : athlete1.giEloRating;
                const athlete2CurrRating = isNoGi ? athlete2.noGiEloRating : athlete2.giEloRating;

                const eloResult = applyElo(
                    athlete1CurrRating,
                    athlete2CurrRating,
                    match.winner || 'DRAW',
                    match.competition.tier
                );

                if(isNoGi){
                    await prisma.athlete.update({
                        where:{id:match.athlete1Id},
                        data:{
                            noGiEloRating: eloResult.athlete1NewRating,
                            noGiPeakElo: Math.max(athlete1.noGiPeakElo, eloResult.athlete1NewRating),
                            noGiMatches: athlete1.noGiMatches + 1,
                            totalWins: match.winner === 'ATHLETE1' ? athlete1.totalWins + 1 : athlete1.totalWins,
                            totalLosses: match.winner === 'ATHLETE2' ? athlete1.totalLosses + 1 : athlete1.totalLosses 
                        }
                    });
                } else if(isGi){
                    await prisma.athlete.update({
                        where:{id:match.athlete1Id},
                        data:{
                            giEloRating: eloResult.athlete1NewRating,
                            giPeakElo: Math.max(athlete1.giPeakElo, eloResult.athlete1NewRating),
                            giMatches: athlete1.giMatches + 1,
                            totalWins: match.winner === 'ATHLETE1' ? athlete1.totalWins + 1 : athlete1.totalWins,
                            totalLosses: match.winner === 'ATHLETE2' ? athlete1.totalLosses + 1 : athlete1.totalLosses
                        }
                    });
                }

                if(isNoGi){
                    await prisma.athlete.update({
                        where:{id:match.athlete2Id},
                        data:{
                            noGiEloRating: eloResult.athlete2NewRating,
                            noGiPeakElo: Math.max(athlete2.noGiPeakElo, eloResult.athlete2NewRating),
                            noGiMatches: athlete2.noGiMatches + 1,
                            totalWins: match.winner === 'ATHLETE2' ? athlete2.totalWins + 1 : athlete2.totalWins,
                            totalLosses: match.winner === 'ATHLETE1' ? athlete2.totalLosses + 1 : athlete2.totalLosses 
                        }
                    });
                } else if(isGi){
                    await prisma.athlete.update({
                        where:{id:match.athlete2Id},
                        data:{
                            giEloRating: eloResult.athlete2NewRating,
                            giPeakElo: Math.max(athlete2.giPeakElo, eloResult.athlete2NewRating),
                            giMatches: athlete2.giMatches + 1,
                            totalWins: match.winner === 'ATHLETE2' ? athlete2.totalWins + 1 : athlete2.totalWins,
                            totalLosses: match.winner === 'ATHLETE1' ? athlete2.totalLosses + 1 : athlete2.totalLosses
                        }
                    });
                }

                await prisma.eloHistory.createMany({
                    data: [
                        {
                            athleteId: match.athlete1Id,
                            ratingType: isNoGi ? 'NOGI' : 'GI',
                            oldRating: athlete1CurrRating,
                            newRating: eloResult.athlete1NewRating,
                            change: eloResult.athlete1Change,
                            reason: `Match vs ${athlete2.firstName} ${athlete2.lastName} at ${match.competition.name}`,
                        },
                        {
                            athleteId: match.athlete2Id,
                            ratingType: isNoGi ? 'NOGI' : 'GI',
                            oldRating: athlete2CurrRating,
                            newRating: eloResult.athlete2NewRating,
                            change: eloResult.athlete2Change,
                            reason: `Match vs ${athlete1.firstName} ${athlete1.lastName} at ${match.competition.name}`,
                        }
                    ]
        });
        await prisma.match.update({
          where: {id:match.id},
          data: {
            eloChange1: eloResult.athlete1Change,
            eloChange2: eloResult.athlete2Change,
          }
        });

        matchCountProc++;

        if(matchCountProc % 100 == 0){
            console.log(`Processed ${matchCountProc}/${matches.length} matches`);
        }    
    }catch(error){
        console.error(`Error processing match ${match.id}:`, error);
        errors.push(`Match ${match.id}: ${error}`);
        errCount++;
    }
}

    console.log('Processing complete');
    console.log(`Match total: ${matches.length}`);
    console.log(`Processed: ${matchCountProc}`);
    console.log(`Errors: ${errCount}`);

    return NextResponse.json({
      success: true,
      totalMatches: matches.length,
      matchCountProc,
      errCount,
      errors: errors.length > 0 ? errors.slice(0, 10) : []
    }); 
     
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json({error: 'Failed to process matches', details: error },{status: 500});
  }

}
