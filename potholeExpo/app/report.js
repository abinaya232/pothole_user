import { useLocalSearchParams } from 'expo-router';
import ReportPreview from '../screens/ReportPreview';

export default function ReportScreen() {
  const { data } = useLocalSearchParams();
  return <ReportPreview route={{ params: { data: JSON.parse(data) } }} />;
}
