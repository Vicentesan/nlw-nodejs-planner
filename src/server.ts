import fastify from 'fastify'
import cors from '@fastify/cors'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { createTrip } from './routes/create-trip'
import { confirmTrip } from './routes/confirm-trip'
import { confirmParticipation } from './routes/confirm-participation'
import { createActivity } from './routes/create-activity'
import { fetchActivities } from './routes/fetch-activities'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipation)
app.register(createActivity)
app.register(fetchActivities)

app.listen({port: 3333})
  .then(() => console.log('HTTP server running'))