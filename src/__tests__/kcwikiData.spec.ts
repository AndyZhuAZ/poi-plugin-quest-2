import { version, KcwikiQuestData } from '../../build/kcQuestsData'
import newQuestData from '../../build/kcQuestsData/quests-scn-new.json'

describe('should version correct', () => {
  test('should KcwikiQuestData Game data version correct', () => {
    expect(version).toMatchInlineSnapshot(
      `"9e3d68b81583efb366edf0a296854f08e52ef6e8"`
    )
  })

  test('should KcwikiQuestData Game data keys correct', () => {
    expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
          Array [
            "zh-CN",
          ]
      `)
  })
})

describe('should format correct', () => {
  test('key format', () => {
    Object.keys(KcwikiQuestData['zh-CN']).forEach((key) => {
      // gameId should not extra space
      expect(key.trim()).toEqual(key)
      // gameId should be number
      expect(String(+key)).toEqual(key)
    })
  })

  test('new quest key format', () => {
    Object.keys(newQuestData).forEach((gameId) => {
      // gameId should not extra space
      expect(gameId.trim()).toEqual(gameId)
      // gameId should be number
      expect(String(+gameId)).toEqual(gameId)
    })
  })
})
