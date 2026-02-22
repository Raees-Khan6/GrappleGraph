import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try{
        const athletes = await prisma.athlete.findMany({
            orderBy:{giEloRating: 'desc'}, take: 10 
        });


        return NextResponse.json(athletes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get athletes' }, { status: 500 });
    }
}

export async function POST(request: Request){
    try {
        const body = await request.json();
        const athlete = await prisma.athlete.create({
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                gender: body.gender,
                belt: body.belt,
                giEloRating: body.giEloRating ?? 1500,
                noGiEloRating: body.noGiEloRating ?? 1500
            }
        });


        return NextResponse.json(athlete);
    } catch (error) {
        return NextResponse.json({ error: 'Failed athlete creation' }, { status: 500 });
    }
}
