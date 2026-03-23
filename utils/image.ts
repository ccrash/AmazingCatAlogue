import { Dimensions } from 'react-native'

export const screenWidth = Dimensions.get('window').width

const MAX_IMAGE_HEIGHT = screenWidth * 2

export const calcImageHeight = (imgWidth: number, imgHeight: number) => {
  if (imgWidth <= 0 || imgHeight <= 0) return screenWidth * 0.75
  return Math.min(Math.round((screenWidth * imgHeight) / imgWidth), MAX_IMAGE_HEIGHT)
}