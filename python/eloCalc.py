from enum import Enum
from typing import Tuple

class CompTier(Enum):
    WORLDS = 32             #the k factor is assigned dependant on the prestige of the comp
    INTERNATIONAL = 28
    CONTINENTAL = 24
    REGIONAL = 20
    LOCAL = 16

def calculateExpectScore(ratingA: float, ratingB: float) -> float:
    return 1 / (1 + 10 ** ((ratingB - ratingA) / 400))        # expected score when A v B (win probability)

def calculateNewRatings(winnerELOrating: float, loserELOrating: float, k: int = 32) -> Tuple[float, float]:        # if k val not given default it to 32 (worlds equiv)
    
    # here ELO ratings after are a match will be calculated (new ELO rating after each match)
    # we take the (current) ELO of winners and losers and a k factor 
    # returns a new rating for both the winner and loser

    winnerWinProbability = calculateExpectScore(winnerELOrating, loserELOrating)
    loserLoseProbability = calculateExpectScore(loserELOrating, winnerELOrating)
    winnerActualRes = 1.0      # winner scores 1 (win)
    loserActualRes = 0.0       # loser scores 0 (loss)
    
    winnerChange = k * (winnerActualRes - winnerWinProbability)     # ELO changes calculated
    loserChange = k * (loserActualRes - loserLoseProbability)

    winnerNewRating = round(winnerELOrating + winnerChange)     # new ratings calculated by rating prior with points gained or lost added
    loserNewRating = round(loserELOrating + loserChange)
    return (winnerNewRating, loserNewRating)

def predictMatch(ratingA: float, ratingB: float) -> dict:

    # here we will predict match resutls between two athletes
    # returns win probabilities + expected elo changes 
    
    aWinProb = calculateExpectScore(ratingA, ratingB)
    bWinProb = 1 - aWinProb     # 1 - probability the other athlete wins
    
    aWins = calculateNewRatings(ratingA, ratingB, k=32)
    bWins = calculateNewRatings(ratingB, ratingA, k=32)
    
    return {
        'athlete_a': {
            'current_rating': ratingA,
            'win_probability': round(aWinProb * 100, 1),
            'rating_if_wins': aWins[0],
            'rating_if_loses': bWins[1],
            'gain_if_wins': aWins[0] - ratingA,
            'loss_if_loses': bWins[1] - ratingA
        },
        'athlete_b': {
            'current_rating': ratingB,
            'win_probability': round(bWinProb * 100, 1),
            'rating_if_wins': bWins[0],
            'rating_if_loses': aWins[1],
            'gain_if_wins': bWins[0] - ratingB,
            'loss_if_loses': aWins[1] - ratingB
        }
    }



if __name__ == "__main__":      # test
    gordon_rating = 1740       
    felipe_rating = 1680
    
    new_gordon, new_felipe = calculateNewRatings(
        gordon_rating, 
        felipe_rating, 
        k=CompTier.WORLDS.value
    )
    
    print(f"Gordon Ryan: {gordon_rating} -> {new_gordon}")
    print(f"Felipe Pena: {felipe_rating} -> {new_felipe}")

    prediction = predictMatch(gordon_rating, felipe_rating)
    print(f"\nMatch Prediction:")
    print(f"Gordon win probability: {prediction['athlete_a']['win_probability']}%")
    print(f"Felipe win probability: {prediction['athlete_b']['win_probability']}%")