/*
 * Copyright (c) 2016-2020 Martin Donath <martin.donath@squidfunk.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import {
  MonoTypeOperatorFunction,
  Observable,
  animationFrameScheduler,
  of,
  pipe
} from "rxjs"
import {
  finalize,
  map,
  observeOn,
  shareReplay,
  tap
} from "rxjs/operators"

import { watchElementSize } from "browser"

import { Header, HeaderType } from "../_"
import {
  resetHeaderTitleActive,
  setHeaderTitleActive
} from "../set"

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Watch header
 *
 * @param el - Header element
 *
 * @return Header observable
 */
export function watchHeader(
  el: HTMLElement
): Observable<Omit<Header, "type">> {
  const styles = getComputedStyle(el)
  if ([
    "sticky",                          /* Modern browsers */
    "-webkit-sticky"                   /* Safari */
  ].includes(styles.position)) {
    return watchElementSize(el)
      .pipe(
        map(({ height }) => ({
          sticky: true,
          height
        })),
        shareReplay(1)
      )
  } else {
    return of({
      sticky: false,
      height: 0
    })
  }
}

/* ------------------------------------------------------------------------- */

/**
 * Apply header title type
 *
 * @param el - Header title element
 *
 * @return Operator function
 */
export function applyHeaderType(
  el: HTMLElement
): MonoTypeOperatorFunction<HeaderType> {
  return pipe(

    /* Defer repaint to next animation frame */
    observeOn(animationFrameScheduler),
    tap(type => {
      setHeaderTitleActive(el, type === "page")
    }),

    /* Reset on complete or error */
    finalize(() => {
      resetHeaderTitleActive(el)
    })
  )
}
