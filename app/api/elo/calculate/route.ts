import {NextResponse} from 'next/server';
import { PrismaClient } from '@prisma/client';
import { applyElo } from '@/app/lib/elo';

const prisma = new PrismaClient();

export async function POST(request: Request){
    try{
        const {matchId} = await request.json();
        if(!matchId){
            return NextResponse.json({error: 'matchID required'}, {status: 400});
        }

        const match = await prisma.match.findUnique({
            where: {id: matchId},
            include: {
                athlete1: true, athlete2: true, competition: true
            }
        });

        if(!match){
            return NextResponse.json({error: 'Match not found'}, {status: 404} );
        }

        const isNoGi = match.affectsRatingNoGi;
        const isGi = match.affectsRatingGi;

        const athlete1CurrRating = isNoGi ? match.athlete1.noGiEloRating : match.athlete1.giEloRating;
        const athlete2CurrRating = isNoGi ? match.athlete2.noGiEloRating : match.athlete2.giEloRating;

        const eloResult = applyElo( 
            athlete1CurrRating,
            athlete2CurrRating,
            match.winner || 'DRAW', match.competition.tier
        );

        if(isNoGi){
            await prisma.athlete.update({
                where: {id: match.athlete1Id},
                data: {
                    noGiEloRating: eloResult.athlete1NewRating,
                    noGiPeakElo: Math.max(match.athlete1.noGiPeakElo, eloResult.athlete1NewRating),
                    noGiMatches: match.athlete1.noGiMatches + 1,
                    totalWins: match.winner === 'ATHLETE1' ? match.athlete1.totalWins + 1 : match.athlete1.totalWins,
                    totalLosses: match.winner === 'ATHLETE2' ? match.athlete1.totalLosses + 1 : match.athlete1.totalLosses
                }
            });
        } else if(isGi){
            await prisma.athlete.update({
                where: { id: match.athlete1Id },
                data: {
                    giEloRating: eloResult.athlete1NewRating,
                    giPeakElo: Math.max(match.athlete1.giPeakElo, eloResult.athlete1NewRating),
                    giMatches: match.athlete1.giMatches + 1,
                    totalWins: match.winner === 'ATHLETE1' ? match.athlete1.totalWins + 1 : match.athlete1.totalWins,
                    totalLosses: match.winner === 'ATHLETE2' ? match.athlete1.totalLosses + 1 : match.athlete1.totalLosses
                }
            });
        }

        if(isNoGi) {
            await prisma.athlete.update({
                where: { id: match.athlete2Id },
                data: {
                    noGiEloRating: eloResult.athlete2NewRating,
                    noGiPeakElo: Math.max(match.athlete2.noGiPeakElo, eloResult.athlete2NewRating),
                    noGiMatches: match.athlete2.noGiMatches + 1,
                    totalWins: match.winner === 'ATHLETE2' ? match.athlete2.totalWins + 1 : match.athlete2.totalWins,
                    totalLosses: match.winner === 'ATHLETE1' ? match.athlete2.totalLosses + 1 : match.athlete2.totalLosses
                }
             });
        } else if(isGi){
            await prisma.athlete.update({
                where: { id: match.athlete2Id },
                data: {
                    giEloRating: eloResult.athlete2NewRating,
                    giPeakElo: Math.max(match.athlete2.giPeakElo, eloResult.athlete2NewRating),
                    giMatches: match.athlete2.giMatches + 1,
                    totalWins: match.winner === 'ATHLETE2' ? match.athlete2.totalWins + 1 : match.athlete2.totalWins,
                    totalLosses: match.winner === 'ATHLETE1' ? match.athlete2.totalLosses + 1 : match.athlete2.totalLosses
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
                    reason: `Match vs ${match.athlete2.firstName} at ${match.competition.name}`,
                },
                {
                    athleteId: match.athlete2Id,
                    ratingType: isNoGi ? 'NOGI' : 'GI',
                    oldRating: athlete2CurrRating,
                    newRating: eloResult.athlete2NewRating,
                    change: eloResult.athlete2Change,
                    reason: `Match vs ${match.athlete1.firstName} ${match.athlete1.lastName} at ${match.competition.name}`,

                }
            ]
        });

        await prisma.match.update({
            where: {id: matchId},
            data: {
                eloChange1: eloResult.athlete1Change,
                eloChange2: eloResult.athlete2Change,
            }
        });

        return NextResponse.json({
            success: true,
            matchId,
            athlete1: {
                name: `${match.athlete1.firstName} ${match.athlete1.lastName}`,
                oldRating: athlete1CurrRating,
                newRating: eloResult.athlete1NewRating,
                change: eloResult.athlete1Change 
            },
            athlete2:{
                name: `${match.athlete2.firstName} ${match.athlete2.lastName}`,
                oldRating: athlete2CurrRating,
                newRating: eloResult.athlete2NewRating,
                change: eloResult.athlete2Change
            }
        });

    }catch (error){
        console.error('Processing error on match, error: ', error);
        return NextResponse.json({error: 'Failed to process match'}, {status: 500});
    }
}