import { useLocalSearchParams } from 'expo-router';
import ReportPreview from '../screens/ReportPreview';

export default function ReportScreen() {
  const { data } = useLocalSearchParams(); // fetch query params
  const parsedData = data ? JSON.parse(data) : null;

  return <ReportPreview data={parsedData} />;
}
