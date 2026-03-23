import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { ScreenErrorBoundary } from './screenErrorBoundary'

describe('ScreenErrorBoundary', () => {
  const retry = jest.fn()

  beforeEach(() => {
    retry.mockClear()
  })

  it('renders the title', () => {
    render(<ScreenErrorBoundary error={new Error('boom')} retry={retry} />)
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })

  it('renders the error message', () => {
    render(<ScreenErrorBoundary error={new Error('Network timeout')} retry={retry} />)
    expect(screen.getByText('Network timeout')).toBeTruthy()
  })

  it('renders the Try again button', () => {
    render(<ScreenErrorBoundary error={new Error('boom')} retry={retry} />)
    expect(screen.getByText('Try again')).toBeTruthy()
  })

  it('calls retry when Try again is pressed', () => {
    render(<ScreenErrorBoundary error={new Error('boom')} retry={retry} />)
    fireEvent.press(screen.getByText('Try again'))
    expect(retry).toHaveBeenCalledTimes(1)
  })

  it('does not call retry before the button is pressed', () => {
    render(<ScreenErrorBoundary error={new Error('boom')} retry={retry} />)
    expect(retry).not.toHaveBeenCalled()
  })

  it('calls retry each time the button is pressed', () => {
    render(<ScreenErrorBoundary error={new Error('boom')} retry={retry} />)
    fireEvent.press(screen.getByText('Try again'))
    fireEvent.press(screen.getByText('Try again'))
    expect(retry).toHaveBeenCalledTimes(2)
  })

  it('renders the correct error message for different errors', () => {
    const { rerender } = render(<ScreenErrorBoundary error={new Error('first')} retry={retry} />)
    expect(screen.getByText('first')).toBeTruthy()
    rerender(<ScreenErrorBoundary error={new Error('second')} retry={retry} />)
    expect(screen.getByText('second')).toBeTruthy()
  })
})
