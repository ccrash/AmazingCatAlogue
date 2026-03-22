import { Dimensions } from 'react-native'

export const screenWidth = Dimensions.get('window').width

export const calcImageHeight = (imgWidth: number, imgHeight: number) => {
  if (imgWidth <= 0 || imgHeight <= 0) return screenWidth * 0.75
  return Math.round((screenWidth * imgHeight) / imgWidth)
}