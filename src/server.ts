import cors from '@fastify/cors'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { env } from '@/env'

import { errorHandler } from './error-handler'
import { createActivity } from './routes/activities/create-activity'
import { fetchActivities } from './routes/activities/fetch-activities'
import { createLink } from './routes/links/create-link'
import { fetchLinks } from './routes/links/fetch-links'
import { createInvite } from './routes/participants/create-invite'
import { fetchParticipants } from './routes/participants/fetch-participants'
import { getParticipant } from './routes/participants/get-participant'
import { confirmParticipation } from './routes/trips/confirm-participation'
import { confirmTrip } from './routes/trips/confirm-trip'
import { createTrip } from './routes/trips/create-trip'
import { getTripDetails } from './routes/trips/get-trip-details'
import { updateTrip } from './routes/trips/update-trip'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipation)
app.register(createActivity)
app.register(fetchActivities)
app.register(createLink)
app.register(fetchLinks)
app.register(fetchParticipants)
app.register(createInvite)
app.register(updateTrip)
app.register(getTripDetails)
app.register(getParticipant)

app.listen({ port: env.PORT }).then(() => console.log('HTTP server running'))
