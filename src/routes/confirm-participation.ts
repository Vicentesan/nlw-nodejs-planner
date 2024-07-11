import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { env } from '../env'
import { ClientError } from '../errors/client-error'
import { prisma } from '../lib/prisma'

export async function confirmParticipation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participants/:participantId/confirm',
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
        }),
        response: {
          308: z.null(),
        },
      },
    },
    async (req, res) => {
      const { participantId } = req.params

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      })

      if (!participant) throw new ClientError('Participant not found.')

      if (participant.isConfirmed)
        return res.redirect(`${env.WEB_BASE_URL}/trips/${participant.tripId}`)

      await prisma.participant.update({
        where: {
          id: participantId,
        },
        data: {
          isConfirmed: true,
        },
      })

      return res.redirect(`${env.WEB_BASE_URL}/trips/${participant.tripId}`)
    },
  )
}
