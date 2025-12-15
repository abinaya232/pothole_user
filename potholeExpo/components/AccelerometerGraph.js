import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Line } from 'react-native-svg';

export default function AccelerometerGraph({ data }) {
  const points =
    data.length > 1
      ? data
          .map((d, i) => {
            const x = (i / (data.length - 1)) * 300;
            const y = 120 - ((d.zAxis - 5) / 20) * 120;
            return `${x},${y}`;
          })
          .join(' ')
      : '';

  return (
    <View style={styles.container}>
      <Svg width="100%" height="120">
        <Line
          x1="0"
          y1="60"
          x2="300"
          y2="60"
          stroke="#9CA3AF"
          strokeDasharray="4 4"
        />
        <Polyline
          points={points}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2"
        />
      </Svg>
      <Text style={styles.label}>Baseline: 9.8 m/s²</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
});
