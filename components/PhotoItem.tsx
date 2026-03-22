import React, { useState, useMemo, useCallback, memo } from 'react'
import { ActivityIndicator, Image, Text, View, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Photo } from '@/types/photo'
import { calcImageHeight } from '@utils/image'
import { useStoreDispatch, useStoreSelector } from '@hooks/store'
import { selectIsLiked, toggleLikeAndCache } from '@store/photosSlice'
import { selectVoteInfo, castVoteThunk } from '@store/votesSlice'
import { useTheme } from '@theme/ThemeProvider'
import Heart from '@assets/heart_fill.svg'

type Props = {
  photo: Photo
}

export const PhotoItem = ({ photo }: Props) => {
  const [loaded, setLoaded] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const height = useMemo(() => calcImageHeight(photo.width, photo.height), [photo.width, photo.height])

  const dispatch = useStoreDispatch()
  const isLiked = useStoreSelector((s: any) => selectIsLiked(photo.id)(s))
  const { score, userVote } = useStoreSelector((s: any) => selectVoteInfo(photo.id)(s))

  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const onToggleLike = useCallback(() => {
    dispatch(toggleLikeAndCache(photo.id))
  }, [dispatch, photo.id])

  const onVote = useCallback(async (value: 1 | 0) => {
    if (isVoting || userVote === value) return
    setIsVoting(true)
    await dispatch(castVoteThunk({ imageId: photo.id, value }))
    setIsVoting(false)
  }, [dispatch, photo.id, isVoting, userVote])

  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={[styles.imageWrap, { height }]}>
        {!loaded && <ActivityIndicator accessibilityLabel="Loading image" color={theme.colors.primary} />}
        <Image
          source={{ uri: photo.url }}
          style={[styles.image, { height }]}
          resizeMode="cover"
          onLoadEnd={() => setLoaded(true)}
          accessible
          accessibilityLabel="Cat photo"
        />
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

      {/* Vote bar */}
      <View style={styles.voteBar}>
        <Pressable
          onPress={() => onVote(1)}
          disabled={isVoting || userVote === 1}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Vote up"
          style={[styles.voteBtn, userVote === 1 && styles.voteBtnActive]}
        >
          <Ionicons
            name={userVote === 1 ? 'arrow-up' : 'arrow-up-outline'}
            size={22}
            color={userVote === 1 ? theme.colors.primary : theme.colors.muted}
          />
        </Pressable>

        <Text style={[styles.score, { color: theme.colors.text }]}>{score}</Text>

        <Pressable
          onPress={() => onVote(0)}
          disabled={isVoting || userVote === 0}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Vote down"
          style={[styles.voteBtn, userVote === 0 && styles.voteBtnActive]}
        >
          <Ionicons
            name={userVote === 0 ? 'arrow-down' : 'arrow-down-outline'}
            size={22}
            color={userVote === 0 ? theme.colors.primary : theme.colors.muted}
          />
        </Pressable>
      </View>
    </View>
  )
}

const makeStyles = (t: { scheme: 'light' | 'dark'; colors: any; spacing: (n: number) => number }) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.colors.card,
      width: '100%',
    },
    imageWrap: {
      width: '100%',
      backgroundColor: t.scheme === 'dark' ? '#1f1f1f' : '#eee',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 4,
    },
    image: {
      position: 'absolute',
      width: '100%',
      borderRadius: 6,
    },
    likeBtn: {
      position: 'absolute',
      right: 12,
      bottom: 12,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.55)',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    },
    voteBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: t.spacing(3),
      gap: t.spacing(4),
    },
    voteBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    voteBtnActive: {
      backgroundColor: t.scheme === 'dark' ? 'rgba(255,0,0,0.15)' : 'rgba(255,0,0,0.08)',
    },
    score: {
      fontSize: 18,
      fontWeight: '600',
      minWidth: 32,
      textAlign: 'center',
    },
  })

export default memo(PhotoItem)
