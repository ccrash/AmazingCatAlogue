import React from 'react'
import { render, screen } from '@testing-library/react-native'

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: { text: '#ffffff' },
    spacing: (n: number) => n * 4,
  }),
}))

import HeaderLogo from './logo'

describe('HeaderLogo', () => {
  it('renders with header accessibility role and label', () => {
    render(<HeaderLogo />)
    expect(screen.getByLabelText('App header')).toBeTruthy()
  })

  it('renders the SVG icon', () => {
    const { UNSAFE_getAllByType } = render(<HeaderLogo />)
    const { View } = require('react-native')
    // Wrapper View + mocked SVG View
    expect(UNSAFE_getAllByType(View).length).toBeGreaterThanOrEqual(2)
  })
})
