import sys
import os
import uuid
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dbCon import get_connection
from eloCalc import calculateNewRatings, CompTier

def getCompKfact(competition_name):         # k vals given based upon comp tier
    name_upper = competition_name.upper()
    if 'WORLD' in name_upper or 'ADCC' in name_upper:
        return CompTier.WORLDS.value
    elif 'PAN' in name_upper or 'EURO' in name_upper:
        return CompTier.CONTINENTAL.value
    elif 'INTERNATIONAL' in name_upper:
        return CompTier.INTERNATIONAL.value
    elif 'REGIONAL' in name_upper:
        return CompTier.REGIONAL.value
    else:
        return CompTier.LOCAL.value

def processMatches(ruleset='nogi'):        # matches sorted and ELO updated
    conn = get_connection()
    if not conn:
        print("Could not connect to database")
        return
    cursor = conn.cursor()
    try:
        print(f"Resetting ranks {ruleset} ratings to 1500...")
        if ruleset == 'nogi':
            cursor.execute("""
                UPDATE athletes 
                SET "noGiEloRating" = 1500,
                    "noGiPeakElo" = 1500
            """)
        else:
            cursor.execute("""
                UPDATE athletes 
                SET "giEloRating" = 1500,
                    "giPeakElo" = 1500
            """)
        conn.commit()
        print("Reset Ratings")
        
        print(f"\nFetching all {ruleset} matches...")
        
        # Check which column determines ruleset
        affects_col = '"affectsRatingNoGi"' if ruleset == 'nogi' else '"affectsRatingGi"'
        
        cursor.execute(f"""
            SELECT 
                m.id,
                m."athlete1Id",
                m."athlete2Id",
                m.winner,
                m."matchDate",
                c.name as competition_name,
                c.tier
            FROM matches m
            JOIN competitions c ON m."competitionId" = c.id
            WHERE {affects_col} = true
            ORDER BY m."matchDate" ASC, m.id ASC
        """)
        
        matches = cursor.fetchall()
        total_matches = len(matches)
        print(f"Found {total_matches} matches\n")
        
        processed = 0
        rating_col = '"noGiEloRating"' if ruleset == 'nogi' else '"giEloRating"'
        peak_col = '"noGiPeakElo"' if ruleset == 'nogi' else '"giPeakElo"'
        rating_type = 'NOGI' if ruleset == 'nogi' else 'GI'
        
        for match in matches:
            match_id, athlete1_id, athlete2_id, winner, match_date, comp_name, tier = match
            if winner == 'ATHLETE1':
                winner_id = athlete1_id
                loser_id = athlete2_id
            elif winner == 'ATHLETE2':
                winner_id = athlete2_id
                loser_id = athlete1_id
            else:
                continue
            
            cursor.execute(f"""
                SELECT {rating_col} FROM athletes WHERE id = %s
            """, (winner_id,))
            result = cursor.fetchone()
            if not result:
                continue
            winner_rating = result[0]
            
            cursor.execute(f"""
                SELECT {rating_col} FROM athletes WHERE id = %s
            """, (loser_id,))
            result = cursor.fetchone()
            if not result:
                continue
            loser_rating = result[0]
            k_factor = getCompKfact(comp_name)
            new_winner_rating, new_loser_rating = calculateNewRatings(
                winner_rating,
                loser_rating,
                k_factor
            )
            
            cursor.execute(f"""
                UPDATE athletes 
                SET {rating_col} = %s,
                    {peak_col} = GREATEST({peak_col}, %s)
                WHERE id = %s
            """, (new_winner_rating, new_winner_rating, winner_id))
            
            cursor.execute(f"""
                UPDATE athletes 
                SET {rating_col} = %s
                WHERE id = %s
            """, (new_loser_rating, loser_id))
            
            winner_history_id = str(uuid.uuid4())
            loser_history_id = str(uuid.uuid4())
            
            cursor.execute("""
                INSERT INTO elo_history 
                (id, "athleteId", "ratingType", "oldRating", "newRating", "change", "reason", "timestamp")
                VALUES 
                (%s, %s, %s, %s, %s, %s, %s, %s),
                (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                winner_history_id, winner_id, rating_type, winner_rating, new_winner_rating, 
                new_winner_rating - winner_rating, f'Match {match_id}', match_date,
                loser_history_id, loser_id, rating_type, loser_rating, new_loser_rating,
                new_loser_rating - loser_rating, f'Match {match_id}', match_date
            ))
            
            processed += 1

            if processed % 100 == 0:
                print(f"Processed {processed}/{total_matches} matches...")
                conn.commit()
        
        conn.commit()
        print(f"Complete, Processed {processed} matches")
        
        print(f"\nTop 5 {ruleset.upper()} Athletes:")
        cursor.execute(f"""
            SELECT "firstName", "lastName", {rating_col}
            FROM athletes
            WHERE {rating_col} > 1500
            ORDER BY {rating_col} DESC
            LIMIT 5
        """)
        
        top_athletes = cursor.fetchall()
        for i, (first, last, rating) in enumerate(top_athletes, 1):
            print(f"  {i}. {first} {last} - {rating} ELO")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    ruleset = 'nogi'
    if len(sys.argv) > 1:
        ruleset = sys.argv[1].lower()
    
    print(f"Starting ELO processing for {ruleset.upper()}...")
    processMatches(ruleset)