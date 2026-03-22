import React, { useEffect, useCallback, useMemo } from 'react'
import { ActivityIndicator, RefreshControl, Text, View, FlatList, StyleSheet } from 'react-native'
import PhotoItem from '../../components/PhotoItem'
import { useStoreDispatch, useStoreSelector } from '../../hooks/store'
import {
  loadNextPage,
  resetPhotos,
  photosSelectors,
  selectPage,
  selectIsLoading,
  selectIsFetchingMore,
  selectHasMore
} from '../../store/photosSlice'
import { loadVotes } from '../../store/votesSlice'
import { useTheme } from '../../theme/ThemeProvider'

const AllPhotosScreen = () => {
  const dispatch = useStoreDispatch() as unknown as (action: any) => any

  const items = useStoreSelector((state: any) => photosSelectors.selectAll(state))
  const page = useStoreSelector((state: any) => selectPage(state))
  const isLoading = useStoreSelector((state: any) => selectIsLoading(state))
  const isFetchingMore = useStoreSelector((state: any) => selectIsFetchingMore(state))
  const hasMore = useStoreSelector((state: any) => selectHasMore(state))

  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  useEffect(() => {
    if (page < 0 && !isLoading) {
      dispatch(loadNextPage() as any)
      dispatch(loadVotes() as any)
    }
  }, [dispatch, page, isLoading])

  const onEndReached = useCallback(() => {
    if (isLoading || isFetchingMore || !hasMore) return
    dispatch(loadNextPage() as any)
  }, [dispatch, isLoading, isFetchingMore, hasMore])

  const onRefresh = useCallback(() => {
    dispatch(resetPhotos() as any)
    dispatch(loadNextPage() as any)
  }, [dispatch])

  const renderItem = useCallback(
    ({ item }: { item: typeof items[number] }) => <PhotoItem photo={item} />,
    []
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
    if (isLoading && page < 0) {
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

  return (
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderListFooterComponent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page < 0}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}                 // iOS spinner color
            colors={[theme.colors.primary]}                  // Android spinner color(s)
            progressBackgroundColor={theme.colors.card}      // Android track
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

const makeStyles = (t: { colors: any; spacing: (n: number) => number }) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.colors.bg },
    content: { paddingBottom: 0 },
    footer: { padding: 4 },
    center: { padding: 24, alignItems: 'center' },
    emptyText: { color: t.colors.muted }
  })

export default AllPhotosScreen
