const React = require('react')
const { Text } = require('react-native')

const createIconSet = () => {
  const Icon = ({ name, ...props }) => React.createElement(Text, props, name)
  Icon.displayName = 'Icon'
  return Icon
}

const Ionicons = createIconSet()
const MaterialIcons = createIconSet()
const FontAwesome = createIconSet()
const AntDesign = createIconSet()
const Entypo = createIconSet()
const EvilIcons = createIconSet()
const Feather = createIconSet()
const FontAwesome5 = createIconSet()
const Fontisto = createIconSet()
const Foundation = createIconSet()
const MaterialCommunityIcons = createIconSet()
const Octicons = createIconSet()
const SimpleLineIcons = createIconSet()
const Zocial = createIconSet()

module.exports = {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome5,
  Fontisto,
  Foundation,
  MaterialCommunityIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
  createIconSet,
}
