/**
 * Elo formula -> R' = R + K(S - E)
 * R' = new rating
 * R = curr rating
 * K = k factor (rating changer)
 * S = score (win = 1, 0 = loss, draw = 0.5)
 * E = expected score
 * 
 * expected score -> E = 1 / (1 + 10^((Rb - Ra) / 400))
 * Rb = rating of player b
 * Ra = rating of player a
 */

function calculateExpected(ratingA: number, ratingB: number): number{
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function getKFact(tier: string): number{
    switch (tier){
        case 'WORLDS':
            return 32; // highest because biggest comp
        case 'INTERNATIONAL':
            return 28;
        case 'NATIONAL':
            return 24;
        case 'REGIONALS':
            return 20;
        case 'LOCAL':
            return 16; // lowest because lowest prestige
        default:
            return 20 // default to a normal regional comp
    }
}

export interface EloResult{
    newRating1: number;
    newRating2: number;
    changeRating1: number;
    changeRating2: number;
    expectedScore1: number;
    expectedScore2: number; 
}

export function calculateElo(
    rating1: number,
    rating2: number,
    winner: 'ATHLETE1' | 'ATHLETE2' | 'DRAW',
    kFactor: number): EloResult{
        const expectedScore1 = calculateExpected(rating1, rating2);
        const expectedScore2 = calculateExpected(rating2, rating1);
        let resultVal1: number;
        let resultVal2: number;

        if(winner == "ATHLETE1"){
            resultVal1 = 1;
            resultVal2 = 0;
        } else if(winner == "ATHLETE2"){
            resultVal1 = 0;
            resultVal2 = 1;
        } else {
            resultVal1 = 0.5;
            resultVal2 = 0.5;
        }

        const changeRating1 = kFactor * (resultVal1 - expectedScore1);
        const changeRating2 = kFactor * (resultVal2 - expectedScore2);
        const newRating1 = rating1 + changeRating1;
        const newRating2 = rating2 + changeRating2;

        return{
            newRating1: Math.round(newRating1),
            newRating2: Math.round(newRating2),
            changeRating1: Math.round(changeRating1),
            changeRating2: Math.round(changeRating2),
            expectedScore1,
            expectedScore2
        };
    }

    export interface MatchEloUpdate{
        athlete1NewRating: number;
        athlete2NewRating: number;
        athlete1Change: number;
        athlete2Change: number;
    }

    export function applyElo(
        athlete1CurrentRating: number,
        athlete2CurrentRating: number,
        winner: 'ATHLETE1' | 'ATHLETE2' | 'DRAW',
        competitionTier: string
    ): MatchEloUpdate{
        const kFactor = getKFact(competitionTier);
        const result = calculateElo(athlete1CurrentRating, athlete2CurrentRating, winner, kFactor);
        return{
            athlete1NewRating: result.newRating1,
            athlete2NewRating: result.newRating2,
            athlete1Change: result.changeRating1,
            athlete2Change: result.changeRating2
        };
    }