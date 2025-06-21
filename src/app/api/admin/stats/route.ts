import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { TranslationType } from '@/models/Translation'
import { startOfDay, subDays, addDays } from 'date-fns'

export async function GET(req: Request) {
  const { db } = await connectToDatabase()
  const collection = db.collection('translations')

  const url = new URL(req.url)
  const range = parseInt(url.searchParams.get('range') || '7') // por defecto 7 días

  // Total de traducciones por tipo
  const byType = await collection.aggregate([
    {
      $group: {
        _id: '$translationType',
        count: { $sum: 1 },
      },
    },
  ]).toArray()

  const today = startOfDay(new Date())
  const lastNDays: { date: string; count: number }[] = []

  for (let i = range - 1; i >= 0; i--) {
    const day = startOfDay(subDays(today, i))
    const nextDay = startOfDay(addDays(day, 1))

    const count = await collection.countDocuments({
      createdAt: { $gte: day, $lt: nextDay },
    })

    lastNDays.push({
      date: day.toISOString().slice(0, 10),
      count,
    })
  }

  const total = await collection.countDocuments()

  return NextResponse.json({
    totalTranslations: total,
    translationsByType: byType.reduce(
      (acc, cur) => ({ ...acc, [cur._id]: cur.count }),
      {} as Record<TranslationType, number>
    ),
    last7Days: lastNDays, // mantenemos el mismo nombre por compatibilidad
  })
}
