import { tracing } from "./tracing"
import { createSpan } from "./create-span"

export default {
  config: tracing,
  createSpan,
}