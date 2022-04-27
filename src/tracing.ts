import { getNodeAutoInstrumentations }  from "@opentelemetry/auto-instrumentations-node"
import { NodeTracerProvider } from "@opentelemetry/node"
import { registerInstrumentations } from "@opentelemetry/instrumentation"
import { IgnoreMatcher } from "@opentelemetry/instrumentation-http/build/src/types"
import { BatchSpanProcessor } from "@opentelemetry/tracing"
import { JaegerExporter } from "@opentelemetry/exporter-jaeger"
import { Resource } from "@opentelemetry/resources"
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions"
import { ConsoleOneLineSpanExporter } from "./console-logger"


interface ITracingConfig {
  jaegerEndpoint: string
  serviceName: string
  logTraces?: boolean
  ignoreOutgoingUrls?: IgnoreMatcher[]
  ignoreIncomingPaths?: IgnoreMatcher[]
}

const defaultTracingConfig: Partial<ITracingConfig> = {
  logTraces: true,
}

export function tracing(config: ITracingConfig) {
  config = {
    ...defaultTracingConfig,
    ...config,
  }

  // a log message to inform about tracing enabled
  console.log(
    `📝  tracing enabled, pushing to jaeger: ${config.jaegerEndpoint}`
  )

  // compose the jaeger endpoint using provided root
  const JAEGER_ENDPOINT = `${config.jaegerEndpoint}/api/traces`
  
  // we use the node tracing provider
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
    }),
  })

  // configure the exporters
  const exporter = new JaegerExporter({
    endpoint: JAEGER_ENDPOINT,
  })
  provider.addSpanProcessor(
    new BatchSpanProcessor(exporter)
  )
  if (config.logTraces) {
    provider.addSpanProcessor(
      new BatchSpanProcessor(new ConsoleOneLineSpanExporter())
    )
  }
  // "activates" the provider
  provider.register()

  // we compose the ignore arrays with the default values
  const ignoreOutgoingUrls: IgnoreMatcher[] = [
    ...(config.ignoreOutgoingUrls || []),
    JAEGER_ENDPOINT,
  ]
  const ignoreIncomingPaths: IgnoreMatcher[] = [
    ...(config.ignoreIncomingPaths || []),
    "/hello",
    "/",
  ]

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-http": {
          ignoreOutgoingUrls: ignoreOutgoingUrls,
          ignoreIncomingPaths: ignoreIncomingPaths,
        }
      })
    ]
  })
}