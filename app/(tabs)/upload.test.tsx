import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native'

// --- mocks ---

jest.mock('@theme/ThemeProvider', () => ({
  useTheme: () => ({
    scheme: 'light',
    colors: { bg: '#fff', primary: 'tomato', text: '#111', card: '#fff', border: '#eee' },
    spacing: (n: number) => n * 4,
  }),
}))

const mockUploadPhoto = jest.fn()
const mockUsePhotosStore = jest.fn((selector: any) =>
  typeof selector === 'function' ? selector({ uploadPhoto: mockUploadPhoto }) : { uploadPhoto: mockUploadPhoto }
)

jest.mock('@store/usePhotosStore', () => ({
  usePhotosStore: (selector: any) => mockUsePhotosStore(selector),
}))

const mockRequestPermission = jest.fn()
const mockLaunchImageLibrary = jest.fn()

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: (...args: unknown[]) => mockRequestPermission(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibrary(...args),
}))

const mockNavigate = jest.fn()
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => unknown) => {
    // Run callback once on mount, same as a focus event on first render
    const { useEffect } = require('react')
    useEffect(() => { cb() }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  },
  router: { navigate: (...args: unknown[]) => mockNavigate(...args) },
}))

jest.mock('@assets/cat_silhouette.svg', () => {
  const { View } = require('react-native')
  return (props: any) => <View testID="cat-silhouette" {...props} />
})

const makeAsset = (overrides: Record<string, unknown> = {}) => ({
  uri: 'file://test/cat.jpg',
  mimeType: 'image/jpeg',
  fileSize: 1024 * 100, // 100 KB
  width: 800,
  height: 600,
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  mockRequestPermission.mockResolvedValue({ status: 'granted' })
  mockLaunchImageLibrary.mockResolvedValue({ canceled: true, assets: [] })
  mockUploadPhoto.mockResolvedValue(undefined)
})

import UploadScreen from './upload'

describe('UploadScreen — initial state', () => {
  it('renders the heading', () => {
    render(<UploadScreen />)
    expect(screen.getByText('Upload a Cat')).toBeTruthy()
  })

  it('shows the placeholder and Select Photo button when no image is chosen', () => {
    render(<UploadScreen />)
    expect(screen.getByTestId('cat-silhouette')).toBeTruthy()
    expect(screen.getByText('Select Photo')).toBeTruthy()
  })

  it('does not show the Change button before an image is selected', () => {
    render(<UploadScreen />)
    expect(screen.queryByText('Change')).toBeNull()
  })
})

describe('UploadScreen — image selection', () => {
  it('requests media library permission when tapping Select Photo', async () => {
    render(<UploadScreen />)
    await act(async () => { fireEvent.press(screen.getByText('Select Photo')) })
    expect(mockRequestPermission).toHaveBeenCalledTimes(1)
  })

  it('shows error when permission is denied', async () => {
    mockRequestPermission.mockResolvedValueOnce({ status: 'denied' })
    render(<UploadScreen />)
    await act(async () => { fireEvent.press(screen.getByText('Select Photo')) })
    expect(screen.getByText('Photo library access is required to select an image.')).toBeTruthy()
  })

  it('displays image preview and Upload button after selecting an image', async () => {
    mockLaunchImageLibrary.mockResolvedValueOnce({ canceled: false, assets: [makeAsset()] })
    render(<UploadScreen />)
    await act(async () => { fireEvent.press(screen.getByText('Select Photo')) })
    expect(screen.getByText('Upload')).toBeTruthy()
    expect(screen.getByText('Change')).toBeTruthy()
  })

  it('does not update state when picker is cancelled', async () => {
    mockLaunchImageLibrary.mockResolvedValueOnce({ canceled: true, assets: [] })
    render(<UploadScreen />)
    await act(async () => { fireEvent.press(screen.getByText('Select Photo')) })
    expect(screen.getByText('Select Photo')).toBeTruthy()
    expect(screen.queryByText('Upload')).toBeNull()
  })
})

describe('UploadScreen — validation', () => {
  it('shows error when file exceeds 5 MB', async () => {
    const oversized = makeAsset({ fileSize: 6 * 1024 * 1024 })
    mockLaunchImageLibrary.mockResolvedValueOnce({ canceled: false, assets: [oversized] })
    render(<UploadScreen />)
    await act(async () => { fireEvent.press(screen.getByText('Select Photo')) })
    await act(async () => { fireEvent.press(screen.getByText('Upload')) })
    expect(screen.getByText('Image must be smaller than 5 MB.')).toBeTruthy()
    expect(mockUploadPhoto).not.toHaveBeenCalled()
  })

  it('shows error when MIME type is not allowed', async () => {
    const badType = makeAsset({ mimeType: 'image/bmp' })
    mockLaunchImageLibrary.mockResolvedValueOnce({ canceled: false, assets: [badType] })
    render(<UploadScreen />)
    await act(async () => { fireEvent.press(screen.getByText('Select Photo')) })
    await act(async () => { fireEvent.press(screen.getByText('Upload')) })
    expect(screen.getByText('Only JPEG, PNG, GIF and WebP images are supported.')).toBeTruthy()
    expect(mockUploadPhoto).not.toHaveBeenCalled()
  })
})

describe('UploadScreen — upload flow', () => {
  it('calls uploadPhoto with the selected asset and navigates on success', async () => {
    const asset = makeAsset()
    mockLaunchImageLibrary.mockResolvedValueOnce({ canceled: false, assets: [asset] })
    render(<UploadScreen />)
    await act(async () => { fireEvent.press(screen.getByText('Select Photo')) })
    await act(async () => { fireEvent.press(screen.getByText('Upload')) })

    expect(mockUploadPhoto).toHaveBeenCalledWith(asset)
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/(tabs)'))
  })

  it('shows error message when uploadPhoto rejects', async () => {
    mockUploadPhoto.mockRejectedValueOnce(new Error('Upload failed'))
    mockLaunchImageLibrary.mockResolvedValueOnce({ canceled: false, assets: [makeAsset()] })
    render(<UploadScreen />)
    await act(async () => { fireEvent.press(screen.getByText('Select Photo')) })
    await act(async () => { fireEvent.press(screen.getByText('Upload')) })

    await waitFor(() => expect(screen.getByText('Upload failed')).toBeTruthy())
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('disables the Upload button while uploading', async () => {
    mockUploadPhoto.mockImplementation(() => new Promise(() => {})) // never resolves
    mockLaunchImageLibrary.mockResolvedValueOnce({ canceled: false, assets: [makeAsset()] })
    render(<UploadScreen />)
    await act(async () => { fireEvent.press(screen.getByText('Select Photo')) })

    act(() => { fireEvent.press(screen.getByText('Upload')) })

    await waitFor(() => {
      // The Upload button is replaced by ActivityIndicator during upload
      expect(screen.queryByText('Upload')).toBeNull()
    })
  })
})
