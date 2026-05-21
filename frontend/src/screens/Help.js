import { StyleSheet, Text, View } from 'react-native'

const Help = () => {
  return (
    <View style={styles.container}>
      <Text>Help</Text>
    </View>
  )
}

export default Help

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' }
})
