import { StyleSheet, Text, View } from 'react-native'

const News = () => {
  return (
    <View style={styles.container}>
      <Text>News</Text>
    </View>
  )
}

export default News

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' }
})
