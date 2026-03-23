import { useCallback, useMemo } from 'react'
import { Text, View, FlatList, StyleSheet } from 'react-native'
import MemoPhotoItem from '@components/photoItem'
import { usePhotosStore, selectLikedPhotos } from '@store/usePhotosStore'
import { useTheme } from '@theme/ThemeProvider'
import type { AppTheme } from '@theme/tokens'
import { useShallow } from 'zustand/react/shallow'

const FavoriteScreen = () => {
  const liked = usePhotosStore(useShallow(selectLikedPhotos))

  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const renderItem = useCallback(
    ({ item }: { item: typeof liked[number] }) => (
      <View style={styles.item}>
        <MemoPhotoItem photo={item} />
      </View>
    ),
    [styles]
  )

  const renderEmpty = () => (
    <View style={styles.center}>
      <Text style={styles.emptyText}>No favorites yet</Text>
    </View>
  )

  return (
      <FlatList
        data={liked}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={7}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={16}
        ListEmptyComponent={renderEmpty}
      />
  )
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    item: { padding: 8 },
    center: { padding: 24, alignItems: 'center' },
    emptyText: { color: t.colors.muted }
  })

export { ScreenErrorBoundary as ErrorBoundary } from '@components/screenErrorBoundary'
export default FavoriteScreen
