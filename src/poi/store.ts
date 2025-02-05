import { name as PACKAGE_NAME } from '../../package.json'
import type { PluginState } from '../reducer'
import { id, noop } from '../utils'
import { importFromPoi, IN_POI } from './env'
import type { PoiState, Store } from './types'

/**
 * See https://redux.js.org/api/store#subscribelistener
 */
const observeStore = <State, SelectedState = State>(
  store: Store<State>,
  onChange: (state: SelectedState) => void,
  selector: (s: State) => SelectedState = id as any
) => {
  let currentState: SelectedState

  const handleChange = () => {
    const nextState = selector(store.getState())
    if (nextState !== currentState) {
      currentState = nextState
      onChange(currentState)
    }
  }

  const unsubscribe = store.subscribe(handleChange)
  handleChange()
  return unsubscribe
}

export const observePoiStore = <SelectedState = PoiState>(
  onChange: (state: SelectedState) => void,
  selector: (state: PoiState) => SelectedState = id as any
) => {
  let valid = true
  let unsubscribe = noop
  getPoiStore().then((store) => {
    if (!valid) {
      return
    }
    unsubscribe = observeStore(store, onChange, selector)
  })

  return () => {
    valid = false
    unsubscribe()
  }
}

export const observePluginStore = <SelectedState = PluginState>(
  onChange: (state: SelectedState) => void,
  selector: (state: PluginState) => SelectedState = id as any
) => observePoiStore(onChange, (s) => selector(s?.ext[PACKAGE_NAME]))

const fallbackStore: Store<PoiState> = {
  getState: noop as () => PoiState,
  subscribe: () => (() => {}) as () => () => void,
}

let globalStore: Store<PoiState> | null = null
/**
 * Get poi global Store if in poi env
 */
export const getPoiStore: () => Promise<Store<PoiState>> = async () => {
  if (globalStore !== null) {
    return globalStore
  }
  if (IN_POI) {
    try {
      const { store } = await importFromPoi('views/create-store')
      globalStore = store
      return store
    } catch (error) {
      console.warn('Load global store error', error)
    }
  }
  globalStore = fallbackStore
  return fallbackStore
}
