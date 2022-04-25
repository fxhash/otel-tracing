import { ExportResult, ExportResultCode, hrTimeToMicroseconds } from '@opentelemetry/core'
import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing'

/**
 * A console exporter designed to export output on a single line, which makes
 * search much easier with fxhash backend monitoring architecture.
 */
export class ConsoleOneLineSpanExporter implements SpanExporter {
  /**
   * Export spans.
   * @param spans
   * @param resultCallback
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    return this._sendSpans(spans, resultCallback);
  }

  /**
   * Shutdown the exporter.
   */
  shutdown(): Promise<void> {
    this._sendSpans([]);
    return Promise.resolve();
  }

  /**
   * converts span info into more readable format
   * @param span
   */
  private _exportInfo(span: ReadableSpan) {
    return {
      traceId: span.spanContext().traceId,
      parentId: span.parentSpanId,
      name: span.name,
      id: span.spanContext().spanId,
      kind: span.kind,
      timestamp: hrTimeToMicroseconds(span.startTime),
      duration: hrTimeToMicroseconds(span.duration),
      attributes: span.attributes,
      status: span.status,
      events: span.events,
    };
  }

  /**
   * Showing spans in console
   * @param spans
   * @param done
   */
  private _sendSpans(
    spans: ReadableSpan[],
    done?: (result: ExportResult) => void
  ): void {
    for (const span of spans) {
      console.log(JSON.stringify(this._exportInfo(span)))
    }
    if (done) {
      return done({ code: ExportResultCode.SUCCESS });
    }
  }
}