import { useEffect, useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, RefreshControl, Text, View, FlatList, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import MemoPhotoItem from '@components/photoItem'
import { usePhotosStore, selectAllPhotos } from '@store/usePhotosStore'
import { useVotesStore } from '@store/useVotesStore'
import { useTheme } from '@theme/ThemeProvider'
import type { AppTheme } from '@theme/tokens'
import { useShallow } from 'zustand/react/shallow'

const AllPhotosScreen = () => {
  const items = usePhotosStore(useShallow(selectAllPhotos))
  const page = usePhotosStore(s => s.page)
  const isLoading = usePhotosStore(s => s.isLoading)
  const isFetchingMore = usePhotosStore(s => s.isFetchingMore)
  const hasMore = usePhotosStore(s => s.hasMore)
  const loadNextPage = usePhotosStore(s => s.loadNextPage)
  const reset = usePhotosStore(s => s.reset)
  const loadFavourites = usePhotosStore(s => s.loadFavourites)
  const loadVotes = useVotesStore(s => s.loadVotes)

  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  useEffect(() => {
    if (page < 0 && !isLoading) {
      loadNextPage()
    }
  }, [page, isLoading, loadNextPage])

  const onEndReached = useCallback(() => {
    if (isLoading || isFetchingMore || !hasMore) return
    loadNextPage()
  }, [isLoading, isFetchingMore, hasMore])

  const [columns, setColumns] = useState<1 | 2>(2)

  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!isLoading) setIsRefreshing(false)
  }, [isLoading])

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    reset()
    loadNextPage()
    loadVotes()
    loadFavourites()
  }, [reset, loadNextPage, loadVotes, loadFavourites])

  const renderItem = useCallback(
    ({ item }: { item: typeof items[number] }) => (
      <View style={styles.item}>
        <MemoPhotoItem photo={item} />
      </View>
    ),
    [styles]
  )

  const renderListFooterComponent = () => {
    if (isFetchingMore && hasMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )
    }
    return null
  }

  const renderListEmptyComponent = () => {
    if (isLoading && page < 0 && !isRefreshing) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )
    }
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No photos yet</Text>
      </View>
    )
  }

  const listHeader = (
    <View style={styles.topBar}>
      <Pressable
        onPress={() => setColumns(c => c === 1 ? 2 : 1)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={columns === 1 ? 'Switch to two-column layout' : 'Switch to single-column layout'}
      >
        <Ionicons
          name={columns === 1 ? 'grid-outline' : 'list-outline'}
          size={24}
          color={theme.colors.primary}
        />
      </Pressable>
    </View>
  )

  return (
      <FlatList
        key={columns}
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={columns}
        ListHeaderComponent={listHeader}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderListFooterComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.card}
          />
        }
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={7}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={16}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        contentContainerStyle={styles.content}
        ListEmptyComponent={renderListEmptyComponent}
      />
  )
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    content: { paddingBottom: 0 },
    topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 12, paddingVertical: 8 },
    item: { padding: 8, flex: 1 },
    footer: { padding: 4 },
    center: { padding: 24, alignItems: 'center' },
    emptyText: { color: t.colors.muted }
  })

export { ScreenErrorBoundary as ErrorBoundary } from '@components/screenErrorBoundary'
export default AllPhotosScreen
