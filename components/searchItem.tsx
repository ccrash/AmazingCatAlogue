import { useState, useMemo, memo } from 'react'
import { ActivityIndicator, Image, Text, View, Pressable, StyleSheet } from 'react-native'
import type { Breed } from '@/types/breed'
import { useTheme } from '@theme/ThemeProvider'

const IMAGE_BASE = 'https://cdn2.thecatapi.com/images'
const IMAGE_HEIGHT = 220

type Props = {
  breed: Breed
}

const SearchItem = ({ breed }: Props) => {
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const imageUri = breed.reference_image_id
    ? `${IMAGE_BASE}/${breed.reference_image_id}.jpg`
    : null

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUri ? (
          <>
            {!loaded && (
              <ActivityIndicator accessibilityLabel="Loading image" color={theme.colors.primary} />
            )}
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
              onLoadEnd={() => setLoaded(true)}
              accessible
              accessibilityLabel={`${breed.name} cat photo`}
            />
          </>
        ) : (
          <Text style={styles.noImage}>No image</Text>
        )}
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.name}>{breed.name}</Text>
        <Text style={styles.temperament} numberOfLines={2}>{breed.temperament}</Text>
        {breed.description ? (
          <>
            <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
              {breed.description}
            </Text>
            <Pressable onPress={() => setExpanded(e => !e)} hitSlop={8}>
              <Text style={styles.toggle}>{expanded ? 'Show less' : 'Show more'}</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  )
}

const makeStyles = (t: { scheme: 'light' | 'dark'; colors: any; spacing: (n: number) => number }) =>
  StyleSheet.create({
    card: {
      padding: t.spacing(3),
      backgroundColor: t.scheme === 'dark' ? '#eee' : '#1f1f1f',
      width: '100%',
      marginBottom: t.spacing(3),
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
    },
    imageWrap: {
      width: '100%',
      height: IMAGE_HEIGHT,
      backgroundColor: t.scheme === 'dark' ? '#1f1f1f' : '#eee',
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      position: 'absolute',
      width: '100%',
      height: IMAGE_HEIGHT,
      borderRadius: 6,
    },
    noImage: {
      color: t.scheme === 'dark' ? '#1f1f1f' : '#eee',
      fontSize: 14,
    },
    infoBar: {
      paddingTop: t.spacing(3),
      gap: t.spacing(1),
    },
    name: {
      fontSize: 16,
      fontWeight: '700',
      color: t.scheme === 'dark' ? '#1f1f1f' : '#eeeeee',
    },
    temperament: {
      fontSize: 12,
      color: t.scheme === 'dark' ? '#555' : '#aaa',
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      color: t.scheme === 'dark' ? '#1f1f1f' : '#eeeeee',
      marginTop: t.spacing(1),
    },
    toggle: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.primary,
      marginTop: t.spacing(1),
    },
  })

export default memo(SearchItem)
