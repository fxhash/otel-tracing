import otel, { SpanOptions } from "@opentelemetry/api"

// get a single tracer
const tracer = otel.trace.getTracer(`default`)

// a function which creates a span based on the context of the tracer
export function createSpan(name: string, options?: SpanOptions) {
  return tracer.startSpan(
    name,
    options,
    otel.context.active()
  )
}