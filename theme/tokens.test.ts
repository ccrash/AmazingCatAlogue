import { makeTheme, makeNavTheme, ERROR_COLOR } from './tokens'

describe('ERROR_COLOR', () => {
  it('is the expected red hex value', () => {
    expect(ERROR_COLOR).toBe('#ef4444')
  })
})

describe('makeTheme — light', () => {
  const light = makeTheme('light')

  it('sets scheme to light', () => {
    expect(light.scheme).toBe('light')
  })

  it('has the correct background color', () => {
    expect(light.colors.bg).toBe('#fafafa')
  })

  it('has the correct text color', () => {
    expect(light.colors.text).toBe('#111111')
  })

  it('has the correct card color', () => {
    expect(light.colors.card).toBe('#ffffff')
  })

  it('has the correct primary color', () => {
    expect(light.colors.primary).toBe('#F97316')
  })

  it('has the correct border color', () => {
    expect(light.colors.border).toBe('#e5e7eb')
  })

  it('has the correct muted color', () => {
    expect(light.colors.muted).toBe('#6b7280')
  })

  it('has white set to #ffffff', () => {
    expect(light.colors.white).toBe('#ffffff')
  })

  it('has the correct surfaceAlt color', () => {
    expect(light.colors.surfaceAlt).toBe('#1f1f1f')
  })

  it('has the correct onSurfaceAlt color', () => {
    expect(light.colors.onSurfaceAlt).toBe('#eeeeee')
  })

  it('has radius 12', () => {
    expect(light.radius).toBe(12)
  })

  it('spacing multiplies by 4', () => {
    expect(light.spacing(1)).toBe(4)
    expect(light.spacing(3)).toBe(12)
    expect(light.spacing(0)).toBe(0)
  })
})

describe('makeTheme — dark', () => {
  const dark = makeTheme('dark')

  it('sets scheme to dark', () => {
    expect(dark.scheme).toBe('dark')
  })

  it('has the correct background color', () => {
    expect(dark.colors.bg).toBe('#0b0b0b')
  })

  it('has the correct text color', () => {
    expect(dark.colors.text).toBe('#ffffff')
  })

  it('has the correct card color', () => {
    expect(dark.colors.card).toBe('#161616')
  })

  it('has the correct primary color', () => {
    expect(dark.colors.primary).toBe('#F97316')
  })

  it('has the correct border color', () => {
    expect(dark.colors.border).toBe('#2a2a2a')
  })

  it('has the correct muted color', () => {
    expect(dark.colors.muted).toBe('#9ca3af')
  })

  it('has the correct surfaceAlt color', () => {
    expect(dark.colors.surfaceAlt).toBe('#eeeeee')
  })

  it('has the correct onSurfaceAlt color', () => {
    expect(dark.colors.onSurfaceAlt).toBe('#1f1f1f')
  })

  it('surfaceAlt and onSurfaceAlt are inverted between schemes', () => {
    const light = makeTheme('light')
    expect(dark.colors.surfaceAlt).toBe(light.colors.onSurfaceAlt)
    expect(dark.colors.onSurfaceAlt).toBe(light.colors.surfaceAlt)
  })
})

describe('makeNavTheme — light', () => {
  const light = makeTheme('light')
  const nav = makeNavTheme(light)

  it('maps primary color', () => {
    expect(nav.colors.primary).toBe(light.colors.primary)
  })

  it('maps background color', () => {
    expect(nav.colors.background).toBe(light.colors.bg)
  })

  it('maps card color', () => {
    expect(nav.colors.card).toBe(light.colors.card)
  })

  it('maps text color', () => {
    expect(nav.colors.text).toBe(light.colors.text)
  })

  it('maps border color', () => {
    expect(nav.colors.border).toBe(light.colors.border)
  })

  it('maps notification to primary color', () => {
    expect(nav.colors.notification).toBe(light.colors.primary)
  })
})

describe('makeNavTheme — dark', () => {
  const dark = makeTheme('dark')
  const nav = makeNavTheme(dark)

  it('maps primary color', () => {
    expect(nav.colors.primary).toBe(dark.colors.primary)
  })

  it('maps background color', () => {
    expect(nav.colors.background).toBe(dark.colors.bg)
  })

  it('maps card color', () => {
    expect(nav.colors.card).toBe(dark.colors.card)
  })

  it('maps text color', () => {
    expect(nav.colors.text).toBe(dark.colors.text)
  })

  it('maps border color', () => {
    expect(nav.colors.border).toBe(dark.colors.border)
  })

  it('maps notification to primary color', () => {
    expect(nav.colors.notification).toBe(dark.colors.primary)
  })
})
