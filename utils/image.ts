import { Dimensions } from 'react-native'

export const screenWidth = Dimensions.get('window').width

export const calcImageHeight = (imgWidth: number, imgHeight: number, containerWidth: number = screenWidth) => {
  const maxHeight = containerWidth * 2
  if (imgWidth <= 0 || imgHeight <= 0) return containerWidth * 0.75
  return Math.min(Math.round((containerWidth * imgHeight) / imgWidth), maxHeight)
}