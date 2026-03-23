import { useState, useMemo, useCallback, memo } from 'react'
import { ActivityIndicator, Image, Text, View, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Photo } from '@/types/photo'
import { calcImageHeight } from '@utils/image'
import { usePhotosStore, selectIsLiked } from '@store/usePhotosStore'
import { useVotesStore, DEFAULT_VOTE_INFO } from '@store/useVotesStore'
import { useTheme } from '@theme/ThemeProvider'
import Heart from '@assets/heart_fill.svg'

type Props = {
  photo: Photo
}

const PhotoItem = ({ photo }: Props) => {
  const [isVoting, setIsVoting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const height = useMemo(() => calcImageHeight(photo.width, photo.height), [photo.width, photo.height])

  const isLiked = usePhotosStore(selectIsLiked(photo.id))
  const toggleLike = usePhotosStore(s => s.toggleLike)
  const { score, userVote } = useVotesStore(s => s.byImageId[photo.id] ?? DEFAULT_VOTE_INFO)
  const castVote = useVotesStore(s => s.castVote)

  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const onToggleLike = useCallback(() => {
    toggleLike(photo.id)
  }, [toggleLike, photo.id])

  const onVote = useCallback(async (value: 1 | 0) => {
    if (isVoting) return
    setIsVoting(true)
    await castVote(photo.id, value)
    setIsVoting(false)
  }, [castVote, photo.id, isVoting])

  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={[styles.imageWrap, { height }]}>
        {!imageLoaded && (
          <ActivityIndicator accessibilityLabel="Loading image" color={theme.colors.primary} />
        )}
        <Image
          source={{ uri: photo.url }}
          style={[styles.image, { height }]}
          resizeMode="cover"
          onLoadEnd={() => setImageLoaded(true)}
          accessible
          accessibilityLabel="Cat photo"
        />
      </View>
      <View style={styles.interactionBar}>
        {/* Vote bar */}
        <View style={styles.voteBar}>
          <Pressable
            onPress={() => onVote(1)}
            disabled={isVoting}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Vote up"
            style={[styles.voteBtn, userVote === 1 && styles.voteBtnActiveUp]}
          >
            <Ionicons
              name={userVote === 1 ? 'arrow-up' : 'arrow-up-outline'}
              size={22}
              color={theme.scheme === 'dark' ? '#1f1f1f' : '#eee'}
            />
          </Pressable>

          <Text style={styles.score}>{score}</Text>

          <Pressable
            onPress={() => onVote(0)}
            disabled={isVoting}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Vote down"
            style={[styles.voteBtn, userVote === 0 && styles.voteBtnActiveDown]}
          >
            <Ionicons
              name={userVote === 0 ? 'arrow-down' : 'arrow-down-outline'}
              size={22}
              color={theme.scheme === 'dark' ? '#1f1f1f' : '#eee'}
            />
          </Pressable>
        </View>

        {/* Like button */}
        <View style={styles.voteBar}>
          <Pressable
            onPress={onToggleLike}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ selected: isLiked }}
            accessibilityLabel={`${isLiked ? 'Unlike' : 'Like'} cat photo`}
            android_ripple={{ borderless: true, color: 'rgba(255,255,255,0.25)' }}
            style={styles.likeBtn}
          >
            <Heart
              testID='heart'
              width={32}
              height={32}
              fill={isLiked ? theme.colors.primary : '#ffffff'}
            />
          </Pressable>
        </View>
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
      backgroundColor: t.scheme === 'dark' ? '#eee' : '#1f1f1f',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 6,
    },
    image: {
      position: 'absolute',
      width: '100%',
      borderRadius: 6,
    },
    likeBtn: {
      backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.55)',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    interactionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: t.spacing(3),
    },
    voteBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    voteBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    voteBtnActiveUp: {
      backgroundColor: t.scheme === 'dark' ? 'rgba(0,255,0,0.15)' : 'rgba(0,255,0,0.08)',
    },
    voteBtnActiveDown: {
      backgroundColor: t.scheme === 'dark' ? 'rgba(255,0,0,0.15)' : 'rgba(255,0,0,0.08)',
    },
    score: {
      fontSize: 18,
      fontWeight: '600',
      minWidth: 32,
      textAlign: 'center',
      color: t.scheme === 'dark' ? '#1f1f1f' : '#eeeeee',
    },
  })

const MemoPhotoItem = memo(PhotoItem)
export { MemoPhotoItem as PhotoItem }
export default MemoPhotoItem
