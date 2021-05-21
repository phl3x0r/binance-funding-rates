import { Observable } from "rxjs";
import fetch, { RequestInit, Request, Response } from "node-fetch";
import AbortController from "abort-controller";

export function fromFetch(
  input: string | Request,
  init?: RequestInit
): Observable<Response> {
  return new Observable<Response>((subscriber) => {
    const controller = new AbortController();
    const signal = controller.signal;
    let outerSignalHandler: () => void;
    let abortable = true;
    let unsubscribed = false;

    if (init) {
      // If a signal is provided, just have it teardown. It's a cancellation token, basically.
      if (init.signal) {
        outerSignalHandler = () => {
          if (!signal.aborted) {
            controller.abort();
          }
        };
        init.signal.addEventListener("abort", outerSignalHandler);
      }
      init.signal = signal;
    } else {
      init = { signal };
    }

    fetch(input, init)
      .then((response) => {
        abortable = false;
        subscriber.next(response);
        subscriber.complete();
      })
      .catch((err) => {
        abortable = false;
        if (!unsubscribed) {
          // Only forward the error if it wasn't an abort.
          subscriber.error(err);
        }
      });

    return () => {
      unsubscribed = true;
      if (abortable) {
        controller.abort();
      }
    };
  });
}
