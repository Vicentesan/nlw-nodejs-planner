import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { env } from '@/env'
import { ClientError } from '@/errors/client-error'
import { dayjs } from '@/lib/dayjs'
import { resend } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/confirm',
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        response: {
          308: z.null(),
        },
      },
    },
    async (req, res) => {
      const { tripId } = req.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          participants: {
            where: {
              isOwner: false,
              isConfirmed: false,
            },
          },
        },
      })

      if (!trip) throw new ClientError('Trip not found.')

      if (trip.isConfirmed)
        return res.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)

      await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          isConfirmed: true,
        },
      })

      const formattedStartDate = dayjs(trip.startsAt).format('LL')
      const formattedEndDate = dayjs(trip.endsAt).format('LL')

      const baseEmail = {
        from: 'Plann.er <onboarding@resend.dev>',
        subject: `[Plann.er] Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
      }

      await resend.batch.send(
        trip.participants.map((p) => {
          const confirmationLink = `${env.API_BASE_URL}/participants/${p.id}/confirm`

          return {
            ...baseEmail,
            to: p.email.toLowerCase(), // it will only send to other people if you use your own domain on https://resend.com
            html: `
            <div style="font-family: sans-serif font-size: 16px line-height: 1.6">
              <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
              <p></p>
              <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
              <p></p>
              <p>
                <a href="${confirmationLink}">Confirmar viagem</a>
              </p>
              <p></p>
              <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
            </div>
          `.trim(),
          }
        }),
      )

      return res.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
    },
  )
}
