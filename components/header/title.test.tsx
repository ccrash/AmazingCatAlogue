import React from 'react'
import { render, screen } from '@testing-library/react-native'

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: { text: '#111111' },
    spacing: (n: number) => n * 4,
  }),
}))

import HeaderTitle from './title'

describe('HeaderTitle', () => {
  it('renders the app title text', () => {
    render(<HeaderTitle />)
    expect(screen.getByText('CatAlogue')).toBeTruthy()
  })

  it('has header accessibility role and label', () => {
    render(<HeaderTitle />)
    expect(screen.getByLabelText('App header')).toBeTruthy()
  })
})
