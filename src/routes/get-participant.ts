import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function getParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participants/:participantId',
    {
      schema: {
        params: z.object({ participantId: z.string().uuid() }),
        response: {
          200: z.object({
            participant: z.object({
              id: z.string().uuid(),
              name: z.string().nullable(),
              email: z.string().email(),
              isConfirmed: z.boolean(),
            }),
          }),
        },
      },
    },
    async (req, res) => {
      const { participantId } = req.params

      const participant = await prisma.participant.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
          isConfirmed: true,
        },
        where: { id: participantId },
      })

      if (!participant) throw new Error('Participant not found')

      return res.status(200).send({ participant })
    }
  )
}
