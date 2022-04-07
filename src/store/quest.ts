import { useCallback } from 'react'
import { QuestData } from '../../build/kcanotifyGamedata'
import { useGameQuest, usePluginTranslation } from '../poi/hooks'
import { getCategory } from '../questHelper'
import type { UnionQuest } from '../questHelper'
import { useKcwikiData, checkIsKcwikiSupportedLanguages } from './kcwiki'
import { useStore, useSyncWithGame } from './store'

const DEFAULT_LANG = 'ja-JP'

export const checkIsKcanotifySupportedLanguages = (
  lang: string
): lang is keyof typeof QuestData => lang in QuestData

export const isSupportedLanguages = (
  lang: string
): lang is keyof typeof QuestData =>
  checkIsKcanotifySupportedLanguages(lang) ||
  checkIsKcwikiSupportedLanguages(lang)

export const useLanguage = () => {
  const {
    i18n: { language },
  } = usePluginTranslation()
  const lang = checkIsKcanotifySupportedLanguages(language)
    ? language
    : DEFAULT_LANG
  return lang
}

const useQuestMap = () => {
  const lang = useLanguage()
  const kcwikiData = useKcwikiData(lang)
  if (kcwikiData) {
    return kcwikiData
  }
  return QuestData[lang]
}

export const useQuest = (): UnionQuest[] => {
  const docQuestMap = useQuestMap()
  const gameQuest = useGameQuest()
  const { syncWithGame } = useSyncWithGame()

  if (syncWithGame && gameQuest.length) {
    return gameQuest.map((quest) => {
      const gameId = String(quest.api_no)
      if (gameId in docQuestMap) {
        return {
          gameId,
          gameQuest: quest,
          docQuest: docQuestMap[gameId as keyof typeof docQuestMap],
        }
      }

      // Not yet recorded quest
      // May be a new quest
      return {
        gameId,
        gameQuest: quest,
        docQuest: {
          code: `${getCategory(quest.api_category).wikiSymbol}?`,
          name: quest.api_title,
          desc: quest.api_detail,
        },
      }
    })
  } else {
    // Return all recorded quests
    return Object.entries(docQuestMap).map(([gameId, val]) => ({
      gameId,
      // Maybe empty
      gameQuest: gameQuest.find((quest) => quest.api_no === Number(gameId))!,
      docQuest: val,
    }))
  }
}

/**
 * @deprecated Not large card now
 */
export const useLargeCard = () => {
  const {
    store: { largeCard },
    updateStore,
  } = useStore()
  const setLarge = useCallback(
    (gameId: string) => updateStore({ largeCard: gameId }),
    [updateStore]
  )
  const setMinimal = useCallback(
    () => updateStore({ largeCard: null }),
    [updateStore]
  )
  return {
    largeCard,
    setLarge,
    setMinimal,
  }
}
