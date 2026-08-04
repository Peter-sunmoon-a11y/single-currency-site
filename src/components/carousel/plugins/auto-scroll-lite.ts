import type { EmblaCarouselType, OptionsHandlerType } from 'embla-carousel'
import type { AutoScrollOptionsType, AutoScrollType } from 'embla-carousel-auto-scroll'

const defaultOptions = {
  direction: 'forward',
  speed: 2,
  startDelay: 1000,
  active: true,
  breakpoints: {},
  playOnInit: true,
  stopOnFocusIn: true,
  stopOnInteraction: true,
  stopOnMouseEnter: false,
  rootNode: null,
} satisfies AutoScrollOptionsType

function getAutoScrollRootNode(emblaApi: EmblaCarouselType, rootNode: AutoScrollOptionsType['rootNode']) {
  const emblaRootNode = emblaApi.rootNode()
  return (rootNode && rootNode(emblaRootNode)) || emblaRootNode
}

export default function AutoScrollLite(userOptions: AutoScrollOptionsType = {}): AutoScrollType {
  let options: AutoScrollOptionsType
  let emblaApi: EmblaCarouselType
  let destroyed = false
  let startDelay = defaultOptions.startDelay
  let timerId = 0
  let autoScrollActive = false
  let mouseIsOver = false
  let defaultScrollBehaviour: any

  function init(emblaApiInstance: EmblaCarouselType, optionsHandler: OptionsHandlerType) {
    emblaApi = emblaApiInstance
    const { mergeOptions, optionsAtMedia } = optionsHandler

    const optionsBase = mergeOptions(defaultOptions, AutoScrollLite.globalOptions)
    const allOptions = mergeOptions(optionsBase, userOptions)
    options = optionsAtMedia(allOptions)

    if (emblaApi.scrollSnapList().length <= 1) return

    startDelay = options.startDelay ?? defaultOptions.startDelay
    destroyed = false

    defaultScrollBehaviour = emblaApi.internalEngine().scrollBody
    const { eventStore } = emblaApi.internalEngine()
    const isDraggable = !!emblaApi.internalEngine().options.watchDrag
    const root = getAutoScrollRootNode(emblaApi, options.rootNode)

    if (isDraggable) {
      emblaApi.on('pointerDown', pointerDown)
    }

    if (isDraggable && !options.stopOnInteraction) {
      emblaApi.on('pointerUp', pointerUp)
    }

    if (options.stopOnMouseEnter) {
      eventStore.add(root, 'mouseenter', mouseEnter)
    }

    if (options.stopOnMouseEnter && !options.stopOnInteraction) {
      eventStore.add(root, 'mouseleave', mouseLeave)
    }

    if (options.stopOnFocusIn) {
      emblaApi.on('slideFocusStart', stopAutoScroll)
    }

    if (options.stopOnFocusIn && !options.stopOnInteraction) {
      eventStore.add(emblaApi.containerNode(), 'focusout', startAutoScroll)
    }

    if (options.playOnInit) startAutoScroll()
  }

  function destroy() {
    emblaApi
      .off('pointerDown', pointerDown)
      .off('pointerUp', pointerUp)
      .off('slideFocusStart', stopAutoScroll)
      .off('settle', settle)

    stopAutoScroll()
    destroyed = true
    autoScrollActive = false
  }

  function startAutoScroll() {
    if (destroyed) return
    if (autoScrollActive) return

    emblaApi.emit('autoScroll:play')
    const engine = emblaApi.internalEngine()
    const { ownerWindow } = engine

    timerId = ownerWindow.setTimeout(() => {
      engine.scrollBody = createAutoScrollBehaviour(engine)
      engine.animation.start()
    }, startDelay)

    autoScrollActive = true
  }

  function stopAutoScroll() {
    if (destroyed) return
    if (!autoScrollActive) return

    emblaApi.emit('autoScroll:stop')
    const engine = emblaApi.internalEngine()
    const { ownerWindow } = engine

    engine.scrollBody = defaultScrollBehaviour
    ownerWindow.clearTimeout(timerId)
    timerId = 0
    autoScrollActive = false
  }

  function createAutoScrollBehaviour(engine: any) {
    const {
      location,
      previousLocation,
      offsetLocation,
      target,
      limit: { reachedMin, reachedMax, constrain },
      options: { loop },
    } = engine

    const directionSign = options.direction === 'forward' ? -1 : 1
    const noop = () => self

    let bodyVelocity = 0
    let scrollDirection = 0
    let rawLocation = location.get()
    let rawLocationPrevious = 0
    let hasSettled = false

    function seek() {
      previousLocation.set(location)
      bodyVelocity = directionSign * (options.speed ?? defaultOptions.speed)
      rawLocation += bodyVelocity
      location.add(bodyVelocity)
      target.set(location)

      const directionDiff = rawLocation - rawLocationPrevious
      scrollDirection = Math.sign(directionDiff)
      rawLocationPrevious = rawLocation

      const reachedEnd =
        options.direction === 'forward' ? reachedMin(offsetLocation.get()) : reachedMax(offsetLocation.get())

      if (!loop && reachedEnd) {
        hasSettled = true
        const constrainedLocation = constrain(location.get())
        location.set(constrainedLocation)
        target.set(location)
        stopAutoScroll()
      }

      return self
    }

    const self = {
      direction: () => scrollDirection,
      duration: () => -1,
      velocity: () => bodyVelocity,
      settled: () => hasSettled,
      seek,
      useBaseFriction: noop,
      useBaseDuration: noop,
      useFriction: noop,
      useDuration: noop,
    }

    return self
  }

  function pointerDown() {
    if (!mouseIsOver) stopAutoScroll()
  }

  function pointerUp() {
    if (!mouseIsOver) startAutoScrollOnSettle()
  }

  function mouseEnter() {
    mouseIsOver = true
    stopAutoScroll()
  }

  function mouseLeave() {
    mouseIsOver = false
    startAutoScroll()
  }

  function settle() {
    emblaApi.off('settle', settle)
    startAutoScroll()
  }

  function startAutoScrollOnSettle() {
    emblaApi.on('settle', settle)
  }

  function play(startDelayOverride?: number) {
    if (typeof startDelayOverride !== 'undefined') {
      startDelay = startDelayOverride
    }
    startAutoScroll()
  }

  function stop() {
    if (autoScrollActive) stopAutoScroll()
  }

  function reset() {
    if (autoScrollActive) {
      stopAutoScroll()
      startAutoScrollOnSettle()
    }
  }

  function isPlaying() {
    return autoScrollActive
  }

  const self: AutoScrollType = {
    name: 'autoScroll',
    options: userOptions,
    init,
    destroy,
    play,
    stop,
    reset,
    isPlaying,
  }

  return self
}

AutoScrollLite.globalOptions = undefined

