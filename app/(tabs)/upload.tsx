import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useFocusEffect, router } from 'expo-router'
import { usePhotosStore } from '@store/usePhotosStore'
import { useTheme } from '@theme/ThemeProvider'
import { ERROR_COLOR } from '@theme/tokens'
import CatSilhouetteIcon from '@assets/cat_silhouette.svg'

export { ScreenErrorBoundary as ErrorBoundary } from '@components/screenErrorBoundary'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export default function UploadScreen() {
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPhoto = usePhotosStore(s => s.uploadPhoto)
  const theme = useTheme()

  // Reset state each time the tab is focused so it always starts fresh
  useFocusEffect(
    useCallback(() => {
      setAsset(null)
      setError(null)
      setIsUploading(false)
    }, [])
  )

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      setError('Photo library access is required to select an image.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.9,
    })
    if (!result.canceled && result.assets.length > 0) {
      setAsset(result.assets[0])
      setError(null)
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (!asset) return

    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
      setError('Image must be smaller than 5 MB.')
      return
    }
    if (asset.mimeType && !ALLOWED_MIME_TYPES.includes(asset.mimeType)) {
      setError('Only JPEG, PNG, GIF and WebP images are supported.')
      return
    }

    setIsUploading(true)
    setError(null)
    try {
      await uploadPhoto(asset)
      router.navigate('/(tabs)')
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [asset, uploadPhoto])

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.bg }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>Upload a Cat</Text>

      {/* Image preview / picker area */}
      <Pressable
        onPress={isUploading ? undefined : pickImage}
        style={[
          styles.previewBox,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {asset ? (
          <Image source={{ uri: asset.uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <CatSilhouetteIcon width={"20%"} height={"20%"} color={theme.colors.primary} />
            <Text style={[styles.placeholderText, { color: theme.colors.text }]}>
              Tap to select a photo
            </Text>
          </View>
        )}
      </Pressable>

      {/* Error message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Action buttons */}
      <View style={styles.buttons}>
        {asset && !isUploading && (
          <Pressable
            onPress={pickImage}
            style={[styles.btn, styles.btnSecondary, { borderColor: theme.colors.border }]}
          >
            <Text style={[styles.btnText, { color: theme.colors.text }]}>Change</Text>
          </Pressable>
        )}

        <Pressable
          onPress={asset ? handleUpload : pickImage}
          disabled={isUploading}
          style={[
            styles.btn,
            styles.btnPrimary,
            { backgroundColor: theme.colors.primary },
            isUploading && styles.btnDisabled,
          ]}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.btnText, styles.btnTextPrimary]}>
              {asset ? 'Upload' : 'Select Photo'}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  previewBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderIcon: {
    fontSize: 48,
  },
  placeholderText: {
    fontSize: 15
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {},
  btnSecondary: {
    borderWidth: 1.5,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: '#fff',
  },
})
