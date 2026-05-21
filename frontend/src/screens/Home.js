import { StyleSheet, View } from 'react-native';
import Earth3D from '../components/Earth3D';

const Home = () => {
  return (
    <View style={styles.container}>
      <Earth3D />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    container: { flex: 1 }
})