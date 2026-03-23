import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { useTheme } from '@theme/ThemeProvider'
import { ERROR_COLOR } from '@theme/tokens'
import type { AppTheme } from '@theme/tokens'
import { searchBreeds, fetchAllBreeds } from '@utils/api'
import type { Breed } from '@/types/breed'
import SearchItem from '@components/searchItem'
import SearchBar from '@components/searchBar'

export { ScreenErrorBoundary as ErrorBoundary } from '@components/screenErrorBoundary'

const PAGE_SIZE = 5
const DEBOUNCE_MS = 400

const shuffle = (arr: Breed[]): Breed[] => {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Breed[]>([])
  const [allBreeds, setAllBreeds] = useState<Breed[]>([])
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchSeqRef = useRef(0)

  const theme = useTheme()
  const styles = makeStyles(theme)

  const isSearching = query.trim().length > 0
  const results = isSearching ? searchResults : allBreeds.slice(0, displayedCount)
  const hasMore = !isSearching && displayedCount < allBreeds.length

  const loadAllBreeds = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const breeds = await fetchAllBreeds()
      setAllBreeds(shuffle(breeds))
      setDisplayedCount(PAGE_SIZE)
    } catch {
      setError('Failed to load breeds.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllBreeds()
  }, [loadAllBreeds])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setSearchResults([])
      setError(null)
      return
    }
    const seq = ++searchSeqRef.current
    debounceRef.current = setTimeout(async () => {
      setIsSearchLoading(true)
      setError(null)
      try {
        const results = await searchBreeds(query.trim())
        if (seq !== searchSeqRef.current) return
        setSearchResults(results)
      } catch {
        if (seq !== searchSeqRef.current) return
        setError('Search failed. Please try again.')
      } finally {
        if (seq === searchSeqRef.current) setIsSearchLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const onEndReached = useCallback(() => {
    if (!hasMore) return
    setDisplayedCount(c => Math.min(c + PAGE_SIZE, allBreeds.length))
  }, [hasMore, allBreeds.length])

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const breeds = await fetchAllBreeds()
      setAllBreeds(shuffle(breeds))
      setDisplayedCount(PAGE_SIZE)
    } catch {
      setError('Failed to refresh.')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: Breed }) => <SearchItem breed={item} />,
    []
  )

  const renderFooter = () => {
    if (hasMore) return (
      <View style={styles.footer}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    )
    return null
  }

  const renderEmpty = () => {
    if (isLoading || isSearchLoading) return null
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{isSearching ? 'No breeds found' : 'No breeds available'}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search breeds…" />

      {(isLoading || isSearchLoading) && !isRefreshing && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      {!isLoading && !error && (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.card}
            />
          }
        />
      )}
    </View>
  )
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.bg },
    list: { padding: t.spacing(3), gap: t.spacing(3) },
    footer: { paddingVertical: t.spacing(3), alignItems: 'center' },
    center: { padding: 24, alignItems: 'center' },
    muted: { color: t.colors.muted },
    error: { color: ERROR_COLOR, fontSize: 14 },
  })
