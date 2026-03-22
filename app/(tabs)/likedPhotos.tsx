import { useCallback } from 'react'
import { FlatList, Text, View } from 'react-native'
import PhotoItem from '../../components/PhotoItem'
import { useStoreSelector } from '../../hooks/store'
import { selectLikedPhotos } from '../../store/photosSlice'

const LikedPhotosScreen = () => {
  const liked = useStoreSelector((state: any) => selectLikedPhotos(state))

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <PhotoItem photo={item} />
    ),
    []
  )

  const renderEmpty = () => (
    <View style={{ padding: 24, alignItems: 'center' }}>
      <Text>No liked photos yet</Text>
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

export default LikedPhotosScreen
