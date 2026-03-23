import React from 'react'
import { Text } from 'react-native'
import { render, screen } from '@testing-library/react-native'
import { RootErrorBoundary } from './rootErrorBoundary'

// Suppress expected console.error output from React's error boundary machinery
beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => jest.restoreAllMocks())

const Throw = ({ error }: { error: Error }) => {
  throw error
}

describe('RootErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <RootErrorBoundary>
        <Text testID='child'>child</Text>
      </RootErrorBoundary>
    )
    expect(screen.getByTestId('child')).toBeTruthy()
  })

  it('renders the error title when a child throws', () => {
    render(
      <RootErrorBoundary>
        <Throw error={new Error('boom')} />
      </RootErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })

  it('renders the error message when a child throws', () => {
    render(
      <RootErrorBoundary>
        <Throw error={new Error('Network failure')} />
      </RootErrorBoundary>
    )
    expect(screen.getByText('Network failure')).toBeTruthy()
  })
})
