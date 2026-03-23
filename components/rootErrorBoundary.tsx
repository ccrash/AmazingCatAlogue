import { Component, type ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 14, color: '#666', textAlign: 'center' },
})
