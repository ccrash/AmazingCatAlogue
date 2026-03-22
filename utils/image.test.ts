describe('image utils', () => {
  const loadUtilsWithWidth = (width: number) => {
    let utils: typeof import('../utils/image')
    jest.isolateModules(() => {
      jest.doMock('react-native', () => ({
        Dimensions: {
          get: (_: string) => ({
            width,
            height: 800,
            scale: 2,
            fontScale: 2
          })
        }
      }))
      // IMPORTANT: require AFTER the mock so screenWidth uses our width
      utils = require('../utils/image')
    })
    return utils!
  }

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('exports screenWidth from Dimensions at import time', () => {
    const { screenWidth } = loadUtilsWithWidth(360)
    expect(screenWidth).toBe(360)
  })

  it('calcImageHeight returns default (screenWidth * 0.75) when width or height <= 0', () => {
    const { screenWidth, calcImageHeight } = loadUtilsWithWidth(400) // default = 300
    const DEFAULT = screenWidth * 0.75

    expect(calcImageHeight(0, 500)).toBe(DEFAULT)
    expect(calcImageHeight(500, 0)).toBe(DEFAULT)
    expect(calcImageHeight(-1, 500)).toBe(DEFAULT)
    expect(calcImageHeight(500, -1)).toBe(DEFAULT)
  })

  it('calcImageHeight computes proportional height and rounds to nearest integer', () => {
    const { calcImageHeight } = loadUtilsWithWidth(360)
    // 360 * 800 / 1200 = 240 exactly
    expect(calcImageHeight(1200, 800)).toBe(240)
  })

  it('calcImageHeight rounds .5 up correctly', () => {
    const { calcImageHeight } = loadUtilsWithWidth(375)
    // 375 * 500 / 333 ≈ 563.06 → Math.round -> 563
    expect(calcImageHeight(333, 500)).toBe(563)
  })
})
