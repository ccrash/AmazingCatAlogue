import { memo, useMemo } from 'react'
import { TextInput, View, Pressable, StyleSheet, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@theme/ThemeProvider'
import type { AppTheme } from '@theme/tokens'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  style?: ViewStyle
}

const SearchBar = ({ value, onChangeText, placeholder = 'Search...', style }: Props) => {
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const iconColor = theme.colors.muted

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={styles.icon}
          >
            <Ionicons name="close-circle" size={20} color={iconColor} />
          </Pressable>
        ) : (
          <View style={styles.icon}>
            <Ionicons name="search-outline" size={20} color={iconColor} />
          </View>
        )}
      </View>
    </View>
  )
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    wrap: {
      padding: t.spacing(3),
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
      borderRadius: 10,
      backgroundColor: t.colors.card,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingLeft: t.spacing(3),
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: t.colors.text,
    },
    icon: {
      paddingHorizontal: t.spacing(2),
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

export default memo(SearchBar)
